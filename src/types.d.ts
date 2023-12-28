interface ArcadeMap {
  getArcadeTableCFrame: (name: ArcadeTableName) => CFrame
}

interface ArcadeTable extends Model {
  Backbox?: Model & {
    Frame: Model & {
      Explosion?: ParticleEmitter
    }
  }
  Balls: Folder
  Barrier?: BasePart
  Baseplate: BasePart
  Name: ArcadeTableName | ArcadeTableNextName
  NextBaseplate: BasePart
  Seat: Seat & {
    Attachment: Attachment
  }
}

type ArcadeTableName = 'Table1' | 'Table2' | 'Table3' | 'Table4'

type ArcadeTableNextName =
  | 'Table1Next'
  | 'Table2Next'
  | 'Table3Next'
  | 'Table4Next'

type ArcadeTableType = 'Pinball1'

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
  Map?: Folder & {
    Table1?: Model & {
      Baseplate: BasePart
    }
    Table2?: Model & {
      Baseplate: BasePart
    }
    Table3?: Model & {
      Baseplate: BasePart
    }
    Table4?: Model & {
      Baseplate: BasePart
    }
  }
}
