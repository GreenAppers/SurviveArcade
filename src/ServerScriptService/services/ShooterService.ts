import { OnStart, Service } from '@flamework/core'
import FastCast from '@rbxts/fastcast'
import PartCacheConstructor from '@rbxts/partcache'
import { PartCache } from '@rbxts/partcache/out/class'
import { Workspace } from '@rbxts/services'

@Service()
export class ShooterService implements OnStart {
  cosmeticBullet: Part | undefined
  cosmeticBulletsFolder: Folder | undefined
  cosmeticBulletProvider: PartCache<Part> | undefined

  onStart() {
    const DEBUG = false // Whether or not to use debugging features of FastCast, such as cast visualization.
    FastCast.DebugLogging = DEBUG
    FastCast.VisualizeCasts = DEBUG

    // Cosmetic bullet container
    this.cosmeticBulletsFolder =
      Workspace.FindFirstChild<Folder>('CosmeticBulletsFolder') ||
      new Instance('Folder', Workspace)
    this.cosmeticBulletsFolder.Name = 'CosmeticBulletsFolder'

    // Make a base cosmetic bullet object. This will be cloned every time we fire off a ray.
    this.cosmeticBullet = new Instance('Part')
    this.cosmeticBullet.Material = Enum.Material.Neon
    this.cosmeticBullet.Color = Color3.fromRGB(0, 196, 255)
    this.cosmeticBullet.CanCollide = false
    this.cosmeticBullet.Anchored = true
    this.cosmeticBullet.Size = new Vector3(0.2, 0.2, 2.4)

    // NEW V13.1.0 - PartCache tie-in. If you use the PartCache module to create cosmetic bullets, you can now directly tie that in.
    // Ensure you're using the latest version of PartCache.
    this.cosmeticBulletProvider = new PartCacheConstructor(
      this.cosmeticBullet,
      100,
    )
    this.cosmeticBulletProvider.SetCacheParent(this.cosmeticBulletsFolder)
  }

  getCosmeticBulletsFolder(): Folder {
    if (!this.cosmeticBulletsFolder)
      throw 'Cosmetic Bullets Folder not initialized'
    return this.cosmeticBulletsFolder
  }

  getCosmeticBulletProvider(): PartCache<Part> {
    if (!this.cosmeticBulletProvider)
      throw 'Cosmetic Part Provider not initialized'
    return this.cosmeticBulletProvider
  }
}
