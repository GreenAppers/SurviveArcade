interface ArcadeMap {
  Baseplate: BasePart
  ChangeMachine: ChangeMachine
  LeaderboardLevity: Leaderboard
  Skybox?: Sky
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

interface ArcadeTable extends Model {
  Backbox?: ArcadeTableBackbox
  Balls: Folder
  Barrier?: BasePart
  Box: Folder & {
    UpperWall?: BasePart
  }
  Baseplate: BasePart
  Ground: BasePart
  Name: ArcadeTableName
  NextBaseplate: BasePart
  PlayZone: BasePart
  Seat: Seat & {
    Attachment: Attachment
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

type ArcadeTableMap = 'Pinball1'

interface Cabinet extends Model {
  Baseplate: BasePart
  Truss1: CabinetTruss
  Truss2: CabinetTruss
  Truss3: CabinetTruss
  Truss4: CabinetTruss
}

interface CabinetTruss extends TrussPart {
  Attachment: Attachment
}

type CabinetTrussName = 'Truss1' | 'Truss2' | 'Truss3' | 'Truss4'

type Currency = 'Dollars' | 'Levity' | 'Tickets'

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

interface CollectGui extends ScreenGui {
  Frame: Frame & {
    [labelName: string]: TextLabel
  }
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

interface Flipper extends Model {
  Flipper: BasePart & {
    Rotor: BasePart
  }
}

interface ChangeMachine extends Model {
  Coin: MeshPart
  Wedge: WedgePart & {
    Attachment: Attachment
  }
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

interface PlayerCharacter extends Model {
  Humanoid: Humanoid
}

interface ReplicatedStorage extends Instance {
  ArcadeTables: Folder & {
    Pinball1: ArcadeTable
  }
  Common: Folder & {
    Beam: Beam
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
  Tools: Folder & {
    ArcadeGun: Tool
    Popcorn: Tool
  }
  Tycoons: Folder & {
    Elf: Tycoon
    Human: Tycoon
    Omniverse: Tycoon
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

type ToolName = 'ArcadeGun' | 'Popcorn'

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

interface Workspace extends Instance {
  Audio: Folder & {
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
  Map: Folder & ArcadeMap
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
