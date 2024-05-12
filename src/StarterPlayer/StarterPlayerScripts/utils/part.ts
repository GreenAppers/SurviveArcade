export function createBulletAdjuster(
  muzzle: BasePart,
  parent?: Instance,
  bulletName = 'Bullet',
) {
  ;(parent || muzzle).ChildAdded.Connect((bullet) => {
    if (bullet.Name === bulletName && bullet.IsA('BasePart'))
      bullet.CFrame = muzzle.CFrame
  })
}
