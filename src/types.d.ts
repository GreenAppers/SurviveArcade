interface ArcadeTable extends Model {
  Backbox?: Model & {
    Frame: Model & {
      Explosion?: ParticleEmitter
    }
  }
  Balls: Folder
  Barrier?: BasePart
  Box: Folder & {
    UpperWall?: BasePart
  }
  Baseplate: BasePart
  Ground: BasePart
  Name: ArcadeTableName | ArcadeTableNextName
  NextBaseplate: BasePart
  PlayZone: BasePart
  Seat: Seat & {
    Attachment: Attachment
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

type Difficulty = 'peaceful' | 'normal'

interface Flipper extends Model {
  Flipper: BasePart & {
    Rotor: BasePart
  }
}

interface ArcadeMap {
  Baseplate: BasePart
  Table1?: Cabinet
  Table2?: Cabinet
  Table3?: Cabinet
  Table4?: Cabinet
  Tycoon1?: TycoonPlot
  Tycoon2?: TycoonPlot
  Tycoon3?: TycoonPlot
  Tycoon4?: TycoonPlot
}

interface PlayerCharacter extends Model {
  Humanoid: Humanoid
}

interface ReplicatedStorage extends Instance {
  ArcadeTables: Folder & {
    Pinball1: ArcadeTable
  }
  Maps: Folder & {
    [mapName: string]: Folder & ArcadeMap
  }
  Tycoons: Folder & {
    Elf: Tycoon
    Human: Tycoon
    Omniverse: Tycoon
  }
}

interface Spinner extends Model {
  Spinner: BasePart & {
    Spinner: BasePart
  }
}

interface Teams extends Instance {
  'Blue Team': Team
  'Green Team': Team
  'Red Team': Team
  'Unclaimed Team': Team
  'Yellow Team': Team
}

type TeamName =
  | 'Blue Team'
  | 'Green Team'
  | 'Red Team'
  | 'Unclaimed Team'
  | 'Yellow Team'

interface Tycoon extends Model {
  Baseplate: BasePart
  Name: TycoonName
}

type TycoonName = 'Tycoon1' | 'Tycoon2' | 'Tycoon3' | 'Tycoon4'

type TycoonType = 'Elf' | 'Human' | 'Omniverse'

interface TycoonPlot extends Model {
  Baseplate: BasePart
  Name: TycoonName
}

interface Workspace extends Instance {
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
  }
}
