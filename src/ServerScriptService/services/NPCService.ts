import { Components } from '@flamework/components'
import { Dependency, OnStart, Service } from '@flamework/core'
import { BehaviorTree3, BehaviorTreeCreator } from '@rbxts/behavior-tree-5'
import { Logger } from '@rbxts/log'
import Object from '@rbxts/object-utils'
import { ReplicatedStorage, ServerStorage, Workspace } from '@rbxts/services'
import {
  DIFFICULTY_TYPES,
  NPC_TYPES,
} from 'ReplicatedStorage/shared/constants/core'
import { selectDifficulty } from 'ReplicatedStorage/shared/state'
import { NPCComponent } from 'ServerScriptService/components/NPC'
import { store } from 'ServerScriptService/store'

@Service()
export class NPCService implements OnStart {
  npc: Record<
    NPCType,
    {
      count: number
      targetCount: number
      type: NPCType
      template?: Model
      behaviorTree?: BehaviorTree3
    }
  > = {
    Rat: {
      count: 0,
      targetCount: 2,
      type: NPC_TYPES.Rat,
    },
    Player: {
      count: 0,
      targetCount: 0,
      type: NPC_TYPES.Player,
    },
  }

  constructor(protected readonly logger: Logger) {}

  onStart() {
    this.npc.Rat.template = ReplicatedStorage.NPC.Rat
    this.npc.Rat.behaviorTree = BehaviorTreeCreator.Create<BehaviorObject>(
      ServerStorage.BehaviorTrees.Zombie,
    )

    const components = Dependency<Components>()
    components.onComponentAdded<NPCComponent>((component) => {
      const npc = this.npc[component.attributes.NPCType]
      npc.count++
      print('Interactable component was added!', npc)
      this.controlPopulation(npc.type)
    })
    components.onComponentRemoved<NPCComponent>((component) => {
      const npc = this.npc[component.attributes.NPCType]
      npc.count--
      print('An enemy was removed!')
      this.controlPopulation(npc.type)
    })

    store.subscribe(selectDifficulty(), (difficulty) => {
      if (difficulty === DIFFICULTY_TYPES.peaceful) {
        this.npc.Rat.targetCount = 0
        this.controlPopulation(this.npc.Rat.type)
      } else {
        this.npc.Rat.targetCount = 2
        this.controlPopulation(this.npc.Rat.type)
      }
    })

    this.controlPopulations()
  }

  controlPopulations() {
    for (const npc of Object.keys(this.npc)) this.controlPopulation(npc)
  }

  controlPopulation(npcType: NPCType) {
    const npc = this.npc[npcType]
    if (npc.count < npc.targetCount) {
      this.growPopulation(npc.type)
    } else if (npc.count > npc.targetCount) {
      this.shrinkPopulation(npc.type)
    }
  }

  growPopulation(npcType: NPCType) {
    const npc = this.npc[npcType]
    for (let i = npc.count; i < npc.targetCount; i++) {
      this.spawn(npc.type)
    }
  }

  shrinkPopulation(npcType: NPCType) {
    const npc = this.npc[npcType]
    for (let i = npc.count; i > npc.targetCount; i--) {
      // sourceHumanoid?.TakeDamage(math.huge)
    }
  }

  spawn(npcType: NPCType) {
    const npc = this.npc[npcType]
    if (!npc.template) return
    const newNpc = npc.template.Clone()
    newNpc.Parent = Workspace.NPC
  }
}
