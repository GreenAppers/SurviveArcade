interface ArcadeTable extends Model {
  Baseplate: BasePart
  Values: Folder & {
    TeamName: StringValue
  }
}

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
}

interface Spinner extends Model {
  Spinner: BasePart & {
    Spinner: BasePart
  }
}

interface Workspace extends Instance {
  ArcadeTables: Folder & {
    Table1?: ArcadeTable
    Table2?: ArcadeTable
    Table3?: ArcadeTable
    Table4?: ArcadeTable
  }
}
