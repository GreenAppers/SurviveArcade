interface Workspace extends Instance {
  ArcadeTables: Folder
}

interface ReplicatedStorage extends Instance {
  ArcadeTables: Folder & {
    Pinball1: Model & {
      Baseplate: BasePart
      Values: Folder & {
        TeamName: StringValue
      }
    }
  }
}
