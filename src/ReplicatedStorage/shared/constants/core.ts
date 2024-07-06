import { Device } from '@rbxts/device'
import { Players, RunService } from '@rbxts/services'
import { $NODE_ENV } from 'rbxts-transform-env'
import { getLastItem } from 'ReplicatedStorage/shared/utils/object'

export const IS_PROD = $NODE_ENV === 'production'
export const IS_CANARY = $NODE_ENV === 'canary'
export const IS_STUDIO = RunService.IsStudio()
export const IS_EDIT = IS_STUDIO && !RunService.IsRunning()

export const START_PLACE_ID = IS_PROD ? -1 : 15699266223
export const HUMAN_PLACE_ID = IS_PROD ? -1 : 16860946152
export const OMNIVERSE_PLACE_ID = IS_PROD ? -1 : -1
export const JOB_ID = tonumber(getLastItem(game.JobId.split('-')) || '0') ?? 0

export const IS_HUMAN_PLACE = game.PlaceId === HUMAN_PLACE_ID
export const IS_OMNIVERSE_PLACE = game.PlaceId === OMNIVERSE_PLACE_ID
export const IS_START_PLACE = !IS_HUMAN_PLACE && !IS_OMNIVERSE_PLACE

export const USER_ID = Players.LocalPlayer ? Players.LocalPlayer.UserId : 0
export const USER_NAME = Players.LocalPlayer
  ? Players.LocalPlayer.Name
  : '(server)'

export const USER_DEVICE = Device.GetPlatformType()

export const TYPE = {
  Attachment: 'Attachment' as const,
  BasePart: 'BasePart' as const,
  BillboardGui: 'BillboardGui' as const,
  Frame: 'Frame' as const,
  Folder: 'Folder' as const,
  Humanoid: 'Humanoid' as const,
  Model: 'Model' as const,
  TextLabel: 'TextLabel' as const,
  UIStroke: 'UIStroke' as const,
}

export const BEHAVIOR_TREE_STATUS = {
  SUCCESS: 1 as const,
  FAIL: 2 as const,
  RUNNING: 3 as const,
}

export const CHARACTER_CHILD = {
  GuideBeam: 'GuideBeam' as const,
  Humanoid: 'Humanoid' as const,
  HumanoidRootPart: 'HumanoidRootPart' as const,
}

export const COLLECT_GUI_ATTRIBUTES = {
  StartPosition: 'StartPosition' as const,
}

export const HUMANOID_ROOT_PART_CHILD = {
  RootRigAttachment: 'RootRigAttachment' as const,
}

export const PLAYER_CHILD = {
  PlayerGui: 'PlayerGui' as const,
}

export const PLAYER_GUI_CHILD = {
  CollectGui: 'CollectGui' as const,
}

export const ARCADE_TABLE_TYPES: {
  [name in ArcadeTableType]: ArcadeTableType
} = {
  Pinball: 'Pinball' as const,
  AirHockey: 'AirHockey' as const,
  Foosball: 'Foosball' as const,
}

export const ARCADE_TABLE_NAMES: ArcadeTableName[] = [
  'Table1',
  'Table2',
  'Table3',
  'Table4',
]

export const ARCADE_TABLE_NEXT_NAMES: ArcadeTableNextName[] = [
  'Table1Next',
  'Table2Next',
  'Table3Next',
  'Table4Next',
]

export const CURRENCY_TYPES: {
  [name in Currency]: Currency
} = {
  Dollars: 'Dollars' as const,
  Levity: 'Levity' as const,
  Tickets: 'Tickets' as const,
}

export const CURRENCY_EMOJIS: {
  [name in Currency]: string
} = {
  Dollars: '💵' as const,
  Levity: '✨' as const,
  Tickets: '🎟️' as const,
}

export const DIFFICULTY_TYPES: {
  [name in Difficulty]: Difficulty
} = {
  peaceful: 'peaceful' as const,
  normal: 'normal' as const,
}

export const GUIDE_CURRENCY_ORDER: Currency[] = ['Tickets', 'Dollars', 'Levity']

export const GUIDE_TRUSS_NAMES: CabinetTrussName[] = ['Truss2', 'Truss3']

export const NPC_TYPES: {
  [name in NPCType]: NPCType
} = {
  Player: 'Player' as const,
  Rat: 'Rat' as const,
} as const

export const TEAM_NAMES: {
  [name in TeamKey]: TeamName
} = {
  BlueTeam: 'Blue Team' as const,
  GreenTeam: 'Green Team' as const,
  RedTeam: 'Red Team' as const,
  UnclaimedTeam: 'Unclaimed Team' as const,
  YellowTeam: 'Yellow Team' as const,
}

export const TOOL_NAMES: {
  [name in ToolName]: ToolName
} = {
  ArcadeGun: 'ArcadeGun' as const,
  Blocks: 'Blocks' as const,
  Popcorn: 'Popcorn' as const,
  Saber: 'Saber' as const,
}

export const TRUSS_NAMES: CabinetTrussName[] = [
  'Truss1',
  'Truss2',
  'Truss3',
  'Truss4',
]

export const TYCOON_NAMES: TycoonName[] = [
  'Tycoon1',
  'Tycoon2',
  'Tycoon3',
  'Tycoon4',
  'Tycoon5',
  'Tycoon6',
  'Tycoon7',
  'Tycoon8',
]

export const TYCOON_ATTRIBUTES = {
  TycoonType: 'TycoonType' as const,
}

export const TYCOON_CHILD: {
  [name in TycoonChild]: TycoonChild
} = {
  Baseplate: 'Baseplate' as const,
  Buttons: 'Buttons' as const,
  Items: 'Items' as const,
  MainItems: 'MainItems' as const,
  Purchases: 'Purchases' as const,
}

export const TYCOON_TYPES: {
  [name in TycoonType]: TycoonType
} = {
  Elf: 'Elf' as const,
  Human: 'Human' as const,
  Omniverse: 'Omniverse' as const,
}
