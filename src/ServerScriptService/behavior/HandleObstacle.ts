import { BEHAVIOR_TREE_STATUS } from 'ReplicatedStorage/shared/constants/core'
import { BehaviorObject } from 'ReplicatedStorage/shared/utils/behavior'

export function run(obj: BehaviorObject, ..._args: unknown[]) {
  const { obstacle, obstaclePos, sourceHumanoid } = obj.Blackboard
  let jumpable = true
  if (
    obstaclePos &&
    obstacle &&
    obstacle.Parent &&
    obstacle.Parent.ClassName !== 'Workspace'
  ) {
    const obstacleHumanoid = obstacle.Parent.FindFirstChildOfClass('Humanoid')
    if (obstacle.IsA('Terrain')) {
      const CellPos = obstacle.WorldToCellPreferSolid(
        obstaclePos.sub(new Vector3(0, 2, 0)),
      )
      const [CellMaterial] = <[Enum.CellMaterial]>(
        obstacle.GetCell(CellPos.X, CellPos.Y, CellPos.Z)
      )
      if (CellMaterial === Enum.CellMaterial.Water) {
        jumpable = false
      }
    } else if (
      obstacleHumanoid ||
      obstacle.ClassName === 'TrussPart' ||
      obstacle.ClassName === 'WedgePart' ||
      (obstacle.Name === 'Handle' && obstacle.Parent.ClassName === 'Hat') ||
      (obstacle.Name === 'Handle' && obstacle.Parent.ClassName === 'Tool')
    ) {
      jumpable = false
    }
  }

  if (
    sourceHumanoid &&
    sourceHumanoid.Health !== 0 &&
    !sourceHumanoid.Sit &&
    jumpable
  ) {
    sourceHumanoid.Jump = true
  }
  return BEHAVIOR_TREE_STATUS.SUCCESS
}
