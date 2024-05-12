import { Debris } from '@rbxts/services'

export function createBullet(
  muzzle: BasePart,
  parent?: Instance,
  owner?: Player,
  ignores?: Instance[],
  bulletName = 'Bullet',
) {
  const bullet = new Instance('Part')
  bullet.Name = bulletName
  bullet.Parent = parent ?? muzzle
  bullet.Anchored = false
  bullet.CanCollide = false
  bullet.FormFactor = Enum.FormFactor.Custom
  bullet.Size = new Vector3(0.4, 10, 0.4)
  bullet.BrickColor = new BrickColor('Bright yellow')
  bullet.Material = Enum.Material.Neon
  new Instance('CylinderMesh', bullet)
  new Instance('BodyForce', bullet).Force = new Vector3(
    0,
    bullet.GetMass() * 196.2,
    0,
  )
  bullet.CFrame = muzzle.CFrame
  bullet.Velocity = bullet.CFrame.VectorToWorldSpace(new Vector3(0, 1, 0)).mul(
    2000,
  )
  if (owner) bullet.SetNetworkOwner(owner)

  bullet.Touched.Connect((hit) => {
    if (ignores) {
      for (const ignore of ignores) if (hit.IsDescendantOf(ignore)) return
    }
    const explosion = new Instance('Explosion', game.Workspace)
    explosion.Position = bullet.Position
    explosion.BlastRadius = 4
    explosion.DestroyJointRadiusPercent = 0
    bullet.Destroy()
  })

  Debris.AddItem(bullet, 1)
}
