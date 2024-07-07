import { Components } from '@flamework/components'
import { Dependency, OnStart, Service } from '@flamework/core'
import { BehaviorTree3, BehaviorTreeCreator } from '@rbxts/behavior-tree-5'
import { Queue } from '@rbxts/datastructures'
import { Logger } from '@rbxts/log'
import Object from '@rbxts/object-utils'
import { ReplicatedStorage, ServerStorage, Workspace } from '@rbxts/services'
import {
  DIFFICULTY_TYPES,
  NPC_TYPES,
} from 'ReplicatedStorage/shared/constants/core'
import { selectDifficulty } from 'ReplicatedStorage/shared/state'
import { BehaviorObject } from 'ReplicatedStorage/shared/utils/behavior'
import { shuffle } from 'ReplicatedStorage/shared/utils/object'
import { getNPCIdFromUserId } from 'ReplicatedStorage/shared/utils/player'
import { NPCComponent } from 'ServerScriptService/components/NPC'
import { MapService } from 'ServerScriptService/services/MapService'
import { store } from 'ServerScriptService/store'
import { takeDamage } from 'ServerScriptService/utils/player'

export interface NPCPopulation {
  name: string
  currentCount: number
  targetCount: number
  type: NPCType
  template?: Model
  behaviorTree?: BehaviorTree3 & { DataLookup?: Map<BehaviorObject, unknown> }
  behaviorTreeOnTick?: boolean
  createPlayer?: boolean
  pathFinding?: boolean
  pathFindingVisualize?: boolean
  respawnNpcIds?: Queue<number>
}

@Service()
export class NPCService implements OnStart {
  population: Record<NPCType, NPCPopulation> = {
    Player: {
      name: 'Cameraman',
      behaviorTreeOnTick: true,
      createPlayer: true,
      currentCount: 0,
      targetCount: 1,
      type: NPC_TYPES.Player,
      pathFinding: true,
      pathFindingVisualize: false,
      respawnNpcIds: new Queue<number>(),
    },
    Rat: {
      name: 'Rat_%d',
      currentCount: 0,
      targetCount: 2,
      type: NPC_TYPES.Rat,
    },
  }

  nextID = 100

  constructor(
    protected readonly logger: Logger,
    protected readonly mapService: MapService,
  ) {}

  getNextId(npcType: NPCType): [number, boolean] {
    const population = this.population[npcType]
    const reuseNpcId = population.respawnNpcIds?.Pop()
    const nextNpcId = reuseNpcId ? reuseNpcId : this.nextID++
    return [nextNpcId, !reuseNpcId]
  }

  onStart() {
    this.population.Player.template = ReplicatedStorage.NPC.Player
    this.population.Player.behaviorTree =
      BehaviorTreeCreator.Create<BehaviorObject>(
        ReplicatedStorage.BehaviorTrees.Player,
      )

    this.population.Rat.template = ReplicatedStorage.NPC.Rat
    this.population.Rat.behaviorTree =
      BehaviorTreeCreator.Create<BehaviorObject>(
        ServerStorage.BehaviorTrees.Zombie,
      )

    const components = Dependency<Components>()
    components.onComponentAdded<NPCComponent>((npc) => {
      const population = this.population[npc.attributes.NPCType]
      population.currentCount++
    })
    components.onComponentRemoved<NPCComponent>((npc) => {
      const population = this.population[npc.attributes.NPCType]
      population.currentCount--
      population.behaviorTree?.DataLookup?.delete(npc.behavior)
      if (population.createPlayer && npc.userId) {
        if (population.respawnNpcIds) {
          population.respawnNpcIds.Push(getNPCIdFromUserId(npc.userId))
        } else {
          store.closePlayerData(npc.userId)
        }
      }
    })

    store.subscribe(selectDifficulty(), (difficulty) => {
      if (difficulty === DIFFICULTY_TYPES.peaceful) {
        this.population.Rat.targetCount = 0
        this.managePopulation(this.population.Rat.type)
      } else {
        this.population.Rat.targetCount = 2
        this.managePopulation(this.population.Rat.type)
      }
    })

    while (wait(0.3)[0]) {
      this.managePopulations()
    }
  }

  managePopulations() {
    for (const npc of Object.keys(this.population)) this.managePopulation(npc)
  }

  managePopulation(npcType: NPCType) {
    const population = this.population[npcType]
    if (population.currentCount < population.targetCount) {
      this.spawnPopulation(population.type)
    } else if (population.currentCount > population.targetCount) {
      this.despawnPopulation(population.type)
    }
  }

  spawnPopulation(npcType: NPCType) {
    const population = this.population[npcType]
    for (let i = population.currentCount; i < population.targetCount; i++) {
      this.spawn(population.type)
    }
  }

  despawnPopulation(npcType: NPCType) {
    const population = this.population[npcType]
    const despawnTotal = math.max(
      0,
      population.currentCount - population.targetCount,
    )
    let despawnCount = 0
    for (const npc of shuffle(
      Dependency<Components>().getAllComponents<NPCComponent>(),
    )) {
      if (despawnCount >= despawnTotal) break
      if (!npc.humanoid || !npc.humanoid.Health) continue
      takeDamage(npc.humanoid, math.huge, undefined, 'population')
      despawnCount++
    }
  }

  spawn(npcType: NPCType) {
    const population = this.population[npcType]
    if (!population.template) return
    const newNpc = population.template.Clone()
    newNpc.Parent = Workspace.NPC
    if (population.createPlayer) {
      newNpc.PivotTo(
        Workspace.Map.SpawnLocation.CFrame.ToWorldSpace(new CFrame(0, 4, 0)),
      )
    } else {
      newNpc.PivotTo(this.mapService.getRandomSpawnLocation())
    }
  }
}
