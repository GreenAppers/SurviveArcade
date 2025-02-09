interface AirHockeyTable extends ArcadeTableBase {
  PuckPlane: BasePart
  ControlPlane: BasePart
}

interface Airplane extends Model {
  AimPart: BasePart & {
    AirplaneGui: BillboardGui
    AirplaneMobileGui: AirplaneMobileGui
  }
  Body: BasePart
  Engine: BasePart
  Guns: Model & {
    Gun1: Model & {
      Muzzle: BasePart
    }
    Gun2: Model & {
      Muzzle: BasePart
    }
  }
  Propeller: BasePart & {
    Hinge: Motor
  }
  Seat: Seat
  Shoot: RemoteEvent
}

interface AirplaneConfig {
  gunsEnabled: boolean
  speed: number
  turnSpeed: number
}

interface AirplaneMobileGui extends ScreenGui {
  Throttle: Frame & {
    Slider: TextButton
  }
}

interface ArcadeMap {
  Baseplate: BasePart
  ChangeMachine: ChangeMachine
  LeaderboardDollars: Leaderboard
  LeaderboardLevity: Leaderboard
  LeaderboardKOs: Leaderboard
  LeaderboardTickets: Leaderboard
  Skybox?: Sky
  SpawnLocation: SpawnLocation
  Table1?: Cabinet
  Table2?: Cabinet
  Table3?: Cabinet
  Table4?: Cabinet
  Tycoon1?: TycoonPlot
  Tycoon2?: TycoonPlot
  Tycoon3?: TycoonPlot
  Tycoon4?: TycoonPlot
  Tycoon5?: TycoonPlot
  Tycoon6?: TycoonPlot
  Tycoon7?: TycoonPlot
  Tycoon8?: TycoonPlot
}

type ArcadeTable = AirHockeyTable | FoosballTable | PinballTable

interface ArcadeTableBase extends Model {
  Backbox?: ArcadeTableBackbox
  Barrier?: BasePart
  Baseplate?: BasePart
  Box: Folder & {
    UpperWall?: BasePart
  }
  Ground: BasePart
  Name: ArcadeTableName
  NextBaseplate: BasePart
  PlayZone: BasePart
  Pieces: Folder
  Control: Model & {
    Seat: Seat & {
      Attachment: Attachment
    }
  }
}

interface ArcadeTableBackbox extends Model {
  Frame: {
    Explosion?: ParticleEmitter
  }
  Scoreboard: BasePart & {
    SurfaceGui: SurfaceGui & {
      Frame: Frame & {
        Glyph00: Sprite
        Glyph01: Sprite
        Glyph02: Sprite
        Glyph03: Sprite
        Glyph04: Sprite
        Glyph05: Sprite
        Glyph06: Sprite
        Glyph07: Sprite
        Glyph08: Sprite
        Glyph09: Sprite
        Glyph10: Sprite
        Glyph11: Sprite
        Glyph12: Sprite
        Glyph13: Sprite
      }
    }
  }
}

type ArcadeTableType = 'Pinball' | 'AirHockey' | 'Foosball'

type ArcadeTableName = 'Table1' | 'Table2' | 'Table3' | 'Table4'

type ArcadeTableNextName =
  | 'Table1Next'
  | 'Table2Next'
  | 'Table3Next'
  | 'Table4Next'

type ArcadeTableMap = 'Pinball1' | 'Foosball1' | 'AirHockey1'

interface BlockBreaker extends Tool {
  BreakBlock: RemoteFunction
}

interface BlockBreakerAttributes {
  MaxDistance: number
}

interface BlockPlacer extends Tool {
  PlaceBlock: RemoteFunction
}

interface BlockPlacerAttributes {
  CanFloat: boolean
  Color: Color3
  IsColorRandom: boolean
  Material: string
  MaxDistance: number
}

interface Cabinet extends Model {
  Ground: BasePart
  Truss1: CabinetTruss
  Truss2: CabinetTruss
  Truss3: CabinetTruss
  Truss4: CabinetTruss
}

interface CabinetTruss extends TrussPart {
  Attachment: Attachment
  TopAttachment: Attachment
}

type CabinetTrussName = 'Truss1' | 'Truss2' | 'Truss3' | 'Truss4'

interface ChangeMachine extends Model {
  Coin: MeshPart
  Wedge: WedgePart & {
    Attachment: Attachment
  }
}

interface CollectGui extends ScreenGui {
  Frame: Frame & {
    [labelName: string]: TextLabel
  }
}

type Currency = 'Dollars' | 'Levity' | 'Tickets'

interface Cutscenes extends Folder {
  LoadedClient: BindableEvent
  LoadedServer: RemoteEvent
  Loading1: Part
  Loading2: Part
}

interface DialogGui extends ScreenGui {
  Frame: Frame & {
    CharacterFrame: Frame & {
      ViewportFrame: ViewportFrame & {
        WorldModel: WorldModel & {
          Wizard: Model & {
            Humanoid: Humanoid & {
              Animator: Animator
            }
            Talk: Animation
          }
          WizardBackdrop: BasePart
        }
      }
    }
    TextFrame: Frame & {
      TextLabel: TextLabel
    }
  }
}

type Difficulty = 'peaceful' | 'normal'

interface Exchange {
  Name: string
  Cost: number
  Currency: string
  Requires: string
  Pays: number
  PaysCurrency: string
  Gives: string
}

interface Flipper extends Model {
  Flipper: BasePart & {
    Rotor: BasePart
    Wedge1: WedgePart
    Wedge2: WedgePart
  }
}

interface FoosballTable extends ArcadeTableBase {}

interface Instance {
  FindFirstChild<X = Instance>(
    this: Instance,
    childName: string | number,
    recursive?: boolean,
  ): X | undefined

  GetChildren<X = Instance>(this: Instance): Array<X>

  WaitForChild<X = Instance>(this: Instance, childName: string | number): X
}

type GamePass = 'ArcadeGun'

interface Leaderboard extends Model {
  Leaderboard: Part & {
    SurfaceGui: SurfaceGui & {
      Frame: Frame & {
        List: ScrollingFrame
      }
    }
    ItemTemplate: Frame & {
      PlayerName: TextLabel
      Photo: ImageLabel
      Rank: TextLabel
      Value: TextLabel
    }
  }
}

interface LoadingGui extends ScreenGui {
  Background: Frame & {
    AssetsLoaded: TextLabel
    BarBackground: Frame & {
      Bar: Frame
    }
    DisplayPercentage: TextLabel
    GameTitle: TextLabel
  }
}

interface LootBox extends Model {
  HitBox: BasePart
}

interface PinballTable extends ArcadeTableBase {
  Baseplate: BasePart
  FlipperLeft: Flipper
  FlipperRight: Flipper
}

type NPCType = 'Player' | 'Rat'

interface NPC extends Model {
  Shell?: Model & {
    Mesh?: SpecialMesh
  }
}

interface NPCAttributes {
  NPCType: NPCType
}

interface PlayerCharacter extends Model {
  Humanoid: Humanoid
}

interface PlayerSpace extends Folder {
  PlacedBlocks: Model
  PlaceBlockPreview: Model
  Vehicles: Folder
}

interface ReplicatedStorage extends Instance {
  ArcadeTables: Folder & {
    AirHockey1: AirHockeyTable
    Foosball1: FoosballTable
    Pinball1: PinballTable
  }
  BehaviorTrees: Folder & {
    Player: Folder
  }
  Common: Folder & {
    Beam: Beam
    LootBox: Model
    PlaceBlockBlock: Part
    PlaceBlockPreview: Part & {
      SelectionBox: SelectionBox
    }
  }
  Guis: Folder & {
    DialogGui: DialogGui
    LoadingGui: ScreenGui & {
      MainFrame: Frame & {
        Title: TextLabel
      }
    }
  }
  Maps: Folder & {
    [mapName: string]: Folder & ArcadeMap
  }
  NPC: Folder & {
    Rat: NPC
    Player: NPC
  }
  Tools: Folder & {
    ArcadeGun: Tool
    BreakBlock: BlockBreaker
    PlaceBlock: BlockPlacer
    Popcorn: Tool
    Saber: Sword
  }
  Tycoons: Folder & {
    Elf: Tycoon
    Human: Tycoon
    Omniverse: Tycoon
  }
  Vehicles: Folder & {
    Airplane: Airplane
  }
}

interface ServerStorage extends Instance {
  BehaviorTrees: Folder & {
    Zombie: Folder
  }
}

interface Shooter extends Tool {
  MouseEvent: RemoteEvent
  Handle: BasePart & {
    Fire: Sound
    GunFirePoint: Attachment
    ImpactParticle: ParticleEmitter
  }
}

interface Sword extends Tool {
  Handle: BasePart
}

interface Spinner extends Model {
  Spinner: BasePart & {
    Spinner: BasePart
  }
}

interface Sprite extends Frame {
  ImageLabel: ImageLabel
}

interface SpriteGeometry {
  x: number
  y: number
  width: number
  height: number
  xoffset: number
  yoffset: number
  xadvance: number
  page: number
  chnl: number
}

interface SpriteSheet {
  maxHeight: number
  maxWidth: number
  glyphs: Record<string, SpriteGeometry>
}

interface StarterGui extends Instance {
  CollectGui: CollectGui
  LoadingGui: LoadingGui
}

interface Teams extends Instance {
  'Blue Team': Team
  'Green Team': Team
  'Red Team': Team
  'Unclaimed Team': Team
  'Yellow Team': Team
}

type TeamKey =
  | 'BlueTeam'
  | 'GreenTeam'
  | 'RedTeam'
  | 'UnclaimedTeam'
  | 'YellowTeam'

type TeamName =
  | 'Blue Team'
  | 'Green Team'
  | 'Red Team'
  | 'Unclaimed Team'
  | 'Yellow Team'

type ToolName = 'ArcadeGun' | 'Blocks' | 'Popcorn' | 'Saber'

interface Tycoon extends Model {
  Baseplate: BasePart
  Buttons: Folder
  Items: Folder
  MainItems: Folder
  Name: TycoonName
  Purchases: Folder
}

type TycoonChild = 'Baseplate' | 'Buttons' | 'Items' | 'MainItems' | 'Purchases'

type TycoonName =
  | 'Tycoon1'
  | 'Tycoon2'
  | 'Tycoon3'
  | 'Tycoon4'
  | 'Tycoon5'
  | 'Tycoon6'
  | 'Tycoon7'
  | 'Tycoon8'

type TycoonType = 'Elf' | 'Human' | 'Omniverse'

interface TycoonButton extends BasePart {
  Attachment: Attachment
  BillboardGui: BillboardGui & {
    Frame: Frame & {
      TextLabel: TextLabel
    }
  }
}

interface TycoonButtonDetails {
  Name: string
  Cost: number
  Currency: string
  Description: string
  Dependencies: string
}

interface TycoonButtonModel extends Model {
  Button: TycoonButton
  Base: BasePart
}

interface TycoonPlot extends Model {
  Baseplate: BasePart
  ClaimTycoon: TycoonButtonModel
  Name: TycoonName
}

interface VehicleSpawner extends Model {
  Screen: BasePart & {
    Spawn: SurfaceGui
  }
  Spawn: RemoteEvent
}

interface Workspace extends Instance {
  Audio: Folder & {
    BlockBroken: Sound
    BlockPlaced: Sound
    ButtonFail: Sound
    ButtonSuccess: Sound
    CollectDollars: Sound
    CollectLevity: Sound
    CollectTickets: Sound
  }
  ArcadeTables: Folder & {
    Table1?: ArcadeTable
    Table2?: ArcadeTable
    Table3?: ArcadeTable
    Table4?: ArcadeTable
    Table1Next?: ArcadeTable
    Table2Next?: ArcadeTable
    Table3Next?: ArcadeTable
    Table4Next?: ArcadeTable
  }
  Cutscenes: Cutscenes
  PlayerSpaces: Folder
  Map: Folder & ArcadeMap
  NPC: Folder
  Tycoons: Folder & {
    Tycoon1?: Tycoon
    Tycoon2?: Tycoon
    Tycoon3?: Tycoon
    Tycoon4?: Tycoon
    Tycoon5?: Tycoon
    Tycoon6?: Tycoon
    Tycoon7?: Tycoon
    Tycoon8?: Tycoon
  }
}
