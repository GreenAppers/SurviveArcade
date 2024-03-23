interface ArcadeMap {
  getArcadeTableCFrame: (name: ArcadeTableName) => CFrame
  getTycoonCFrame: (name: TycoonName) => CFrame
  getTycoonType: () => TycoonType
}

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

interface PlayerCharacter extends Model {
  Humanoid: Humanoid
}

interface ReplicatedStorage extends Instance {
  ArcadeTables: Folder & {
    Pinball1: ArcadeTable
  }
  Maps: Folder & {
    [mapName: string]: Folder & {
      Table1?: Model
      Table2?: Model
      Table3?: Model
      Table4?: Model
    }
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
}

type TycoonName = 'Tycoon1' | 'Tycoon2' | 'Tycoon3' | 'Tycoon4'

type TycoonType = 'Elf' | 'Human' | 'Omniverse'

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
  Map: Folder & {
    Baseplate: BasePart
    Table1?: Cabinet
    Table2?: Cabinet
    Table3?: Cabinet
    Table4?: Cabinet
    Tycoon1?: BasePart
    Tycoon2?: BasePart
    Tycoon3?: BasePart
    Tycoon4?: BasePart
  }
  Tycoons: Folder & {
    Tycoon1?: Tycoon
    Tycoon2?: Tycoon
    Tycoon3?: Tycoon
    Tycoon4?: Tycoon
  }
}
