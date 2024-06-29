import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import FastCast from '@rbxts/fastcast'
import { PartCache } from '@rbxts/partcache/out/class'
import { Debris, Players, Workspace } from '@rbxts/services'
import { ShooterTag } from 'ReplicatedStorage/shared/constants/tags'
import { randomElement } from 'ReplicatedStorage/shared/utils/object'
import { ShooterService } from 'ServerScriptService/services/ShooterService'
import { takeDamage } from 'ServerScriptService/utils/player'

// REMEMBER: THERE'S RESOURCES TO HELP YOU AT https://etithespirit.github.io/FastCastAPIDocs
const BULLET_SPEED = 100 // Studs/second - the speed of the bullet
const BULLET_MAXDIST = 1000 // The furthest distance the bullet can travel
const BULLET_GRAVITY = new Vector3(0, -Workspace.Gravity, 0) // The amount of gravity applied to the bullet in world space (so yes, you can have sideways gravity)
const MIN_BULLET_SPREAD_ANGLE = 1 // THIS VALUE IS VERY SENSITIVE. Try to keep changes to it small. The least accurate the bullet can be. This angle value is in degrees. A value of 0 means straight forward. Generally you want to keep this at 0 so there's at least some chance of a 100% accurate shot.
const MAX_BULLET_SPREAD_ANGLE = 4 // THIS VALUE IS VERY SENSITIVE. Try to keep changes to it small. The most accurate the bullet can be. This angle value is in degrees. A value of 0 means straight forward. This cannot be less than the value above. A value of 90 will allow the gun to shoot sideways at most, and a value of 180 will allow the gun to shoot backwards at most. Exceeding 180 will not add any more angular varience.
const FIRE_DELAY = 0 // The amount of time that must pass after firing the gun before we can fire again.
const BULLETS_PER_SHOT = 1 // The amount of bullets to fire every shot. Make this greater than 1 for a shotgun effect.
const PIERCE_DEMO = true // True if the pierce demo should be used. See the CanRayPierce function for more info.
const TAU = math.pi * 2 // Set up mathematical constant Tau (pi * 2)
const USERDATA_HITS = 'Hits' // The key for the hits data in the cast's UserData
const USERDATA_INIT = 'Init' // The key for the initialization data in the cast's UserData

const BULLET_COLORS = [
  Color3.fromRGB(208, 40, 41),
  Color3.fromRGB(238, 180, 71),
  Color3.fromRGB(85, 152, 207),
]

const reflect = (surfaceNormal: Vector3, bulletNormal: Vector3) =>
  bulletNormal.sub(surfaceNormal.mul(2 * bulletNormal.Dot(surfaceNormal)))

// In production scripts that you are writing that you know you will write properly, you should not do this.
// This is included exclusively as a result of this being an example script, and users may tweak the values incorrectly.
assert(
  MAX_BULLET_SPREAD_ANGLE >= MIN_BULLET_SPREAD_ANGLE,
  'Error: MAX_BULLET_SPREAD_ANGLE cannot be less than MIN_BULLET_SPREAD_ANGLE!',
)
if (MAX_BULLET_SPREAD_ANGLE > 180) {
  warn(
    'Warning: MAX_BULLET_SPREAD_ANGLE is over 180! This will not pose any extra angular randomization.',
  )
}

@Component({ tag: ShooterTag })
export class ShooterComponent
  extends BaseComponent<{}, Shooter>
  implements OnStart
{
  canFire = true // Used for a cooldown.
  caster = new FastCast() // Create a new caster object.
  castBehavior = FastCast.newBehavior()
  cosmeticBulletProvider: PartCache<Part>
  random = new Random() // Set up a randomizer.

  constructor(protected shooterService: ShooterService) {
    super()
    this.cosmeticBulletProvider =
      this.shooterService.getCosmeticBulletProvider()
  }

  onStart() {
    // New raycast parameters.
    const castParams = new RaycastParams()
    castParams.IgnoreWater = true
    castParams.FilterType = Enum.RaycastFilterType.Blacklist
    castParams.FilterDescendantsInstances = []

    // NEW v12.0.0: Casters now use a data packet which can be made like what follows.
    // Check the API for more information: https://etithespirit.github.io/FastCastAPIDocs/fastcast-objects/fcbehavior
    this.castBehavior.RaycastParams = castParams
    this.castBehavior.MaxDistance = BULLET_MAXDIST
    this.castBehavior.HighFidelityBehavior = 1

    // Bonus points: If you're going to be slinging a ton of bullets in a short period of time, you may see it fit to use PartCache.
    // https://devforum.roblox.com/t/partcache-for-all-your-quick-part-creation-needs/246641
    // this.CastBehavior.CosmeticBulletTemplate = CosmeticBullet // Uncomment if you just want a simple template part and aren't using PartCache
    this.castBehavior.CosmeticBulletProvider = this.cosmeticBulletProvider // Comment out if you aren't using PartCache.

    const bulletsFolder = this.shooterService.getCosmeticBulletsFolder()
    this.castBehavior.CosmeticBulletContainer = bulletsFolder
    this.castBehavior.Acceleration = BULLET_GRAVITY
    this.castBehavior.AutoIgnoreContainer = false // We already do this! We don't need the default value of true (see the bottom of this script)

    if (PIERCE_DEMO) {
      // The pierce function can also be used for things like bouncing.
      // In reality, it's more of a function that the module uses to ask "Do I end the cast now, or do I keep going?"
      // Because of this, you can use it for logic such as ray reflection or other redirection methods.
      // A great example might be to pierce or bounce based on something like velocity or angle.
      // You can see this implementation further down in the OnRayPierced function.
      this.castBehavior.CanPierceFunction = (
        cast,
        rayResult,
        _segmentVelocity,
      ) => {
        // Let's keep track of how many times we've hit something.
        const userData = cast.UserData as Record<string, unknown>
        const hits = userData[USERDATA_HITS]
        if (!hits || !typeIs(hits, 'number')) {
          // If the hit data isn't registered, set it to 1 (because this is our first hit)
          userData[USERDATA_HITS] = 1
        } else {
          // If the hit data is registered, add 1.
          userData[USERDATA_HITS] = hits + 1
          // And if the hit count is over 3, don't allow piercing and instead stop the ray.
          if (hits + 1 > 3) {
            return false
          }
        }

        // Now if we make it here, we want our ray to continue.
        // This is extra important! If a bullet bounces off of something, maybe we want it to do damage too!
        // So let's implement that.
        const hitPart = rayResult.Instance
        if (hitPart && hitPart.Parent) {
          const humanoid = hitPart.Parent.FindFirstChildOfClass('Humanoid')
          if (humanoid) {
            takeDamage(
              humanoid,
              10,
              Players.GetPlayerFromCharacter(this.instance.Parent)?.UserId,
            )
          }
        }

        /* // This function shows off the piercing feature literally. Pass this function as the last argument (after bulletAcceleration) and it will run this every time the ray runs into an object.
        // Do note that if you want this to work properly, you will need to edit the OnRayPierced event handler below so that it doesn't bounce.
        if (material == Enum.Material.Plastic or material == Enum.Material.Ice or material == Enum.Material.Glass or material == Enum.Material.SmoothPlastic) {
          // Hit glass, plastic, or ice...
          if (hitPart.Transparency >= 0.5) {
            // And it's >= half transparent...
            return true -- Yes! We can pierce.
          }
        }
        return false */

        // And then lastly, return true to tell FC to continue simulating.
        return true
      }
    }

    this.caster.RayHit.Connect(
      (_cast, raycastResult, _segmentVelocity, _cosmeticBulletObject) => {
        // This function will be connected to the Caster's "RayHit" event.
        const hitPart = raycastResult.Instance
        const hitPoint = raycastResult.Position
        const normal = raycastResult.Normal
        if (hitPart && hitPart.Parent) {
          // Test if we hit something
          const humanoid = hitPart.Parent.FindFirstChildOfClass('Humanoid') // Is there a humanoid?
          if (humanoid)
            takeDamage(
              humanoid,
              10,
              Players.GetPlayerFromCharacter(this.instance.Parent)?.UserId,
            )
          this.makeParticleFX(hitPoint, normal) // Particle FX
        }
      },
    )

    this.caster.RayPierced.Connect(
      (cast, raycastResult, segmentVelocity, _cosmeticBulletObject) => {
        // You can do some really unique stuff with pierce behavior - In reality, pierce is just the module's way of asking "Do I keep the bullet going, or do I stop it here?"
        // You can make use of this unique behavior in a manner like this, for instance, which causes bullets to be bouncy.
        const position = raycastResult.Position
        const normal = raycastResult.Normal

        const newNormal = reflect(normal, segmentVelocity.Unit)
        cast.SetVelocity(newNormal.mul(segmentVelocity.Magnitude))

        // It's super important that we set the cast's position to the ray hit position. Remember: When a pierce is successful, it increments the ray forward by one increment.
        // If we don't do this, it'll actually start the bounce effect one segment *after* it continues through the object, which for thin walls, can cause the bullet to almost get stuck in the wall.
        cast.SetPosition(position)
        // Generally speaking, if you plan to do any velocity modifications to the bullet at all, you should use the line above to reset the position to where it was when the pierce was registered.
      },
    )

    this.caster.LengthChanged.Connect(
      (
        cast,
        segmentOrigin,
        segmentDirection,
        length,
        _segmentVelocity,
        cosmeticBulletObject,
      ) => {
        // Whenever the caster steps forward by one unit, this function is called.
        // The bullet argument is the same object passed into the fire function.
        if (!cosmeticBulletObject || !cosmeticBulletObject.IsA('BasePart'))
          return

        const userData = cast.UserData as Record<string, unknown>
        if (!userData[USERDATA_INIT]) {
          userData[USERDATA_INIT] = 1

          // If the bullet is just starting, we can set up some initial properties.
          const color = randomElement(BULLET_COLORS)
          cosmeticBulletObject.Color = Color3.fromRGB(
            color.R * 255 + this.random.NextInteger(-5, 5),
            color.G * 255 + this.random.NextInteger(-5, 5),
            color.B * 255 + this.random.NextInteger(-5, 5),
          )
        }

        const bulletLength = cosmeticBulletObject.Size.Z / 2 // This is used to move the bullet to the right spot based on a CFrame offset
        const baseCFrame = new CFrame(
          segmentOrigin,
          segmentOrigin.add(segmentDirection),
        )
        cosmeticBulletObject.CFrame = baseCFrame.mul(
          new CFrame(0, 0, -(length - bulletLength)),
        )
      },
    )

    this.caster.CastTerminating.Connect((cast) => {
      const cosmeticBullet = cast.RayInfo.CosmeticBulletObject
      if (cosmeticBullet) {
        // This code here is using an if statement on CastBehavior.CosmeticBulletProvider so that the example gun works out of the box.
        // In your implementation, you should only handle what you're doing (if you use a PartCache, ALWAYS use ReturnPart. If not, ALWAYS use Destroy.
        if (this.cosmeticBulletProvider)
          this.cosmeticBulletProvider.ReturnPart(cosmeticBullet as Part)
        else cosmeticBullet.Destroy()
      }
    })

    this.instance.Equipped.Connect(() => {
      castParams.FilterDescendantsInstances = [
        this.instance.Parent || this.instance,
        bulletsFolder,
      ]
    })

    this.instance.MouseEvent.OnServerEvent.Connect(
      (_clientThatFired, mousePoint) => {
        if (!this.canFire || !typeIs(mousePoint, 'Vector3')) return
        this.canFire = false
        const mouseDirection = mousePoint.sub(
          this.instance.Handle.GunFirePoint.WorldPosition,
        ).Unit
        for (let i = 1; i <= BULLETS_PER_SHOT; i++) {
          this.fire(mouseDirection)
        }
        if (FIRE_DELAY > 0.03) wait(FIRE_DELAY)
        this.canFire = true
      },
    )
  }

  // A function to play fire sounds.
  playFireSound() {
    const handle = this.instance.Handle
    const NewSound = handle.Fire.Clone()
    NewSound.Parent = handle
    NewSound.Play()
    Debris.AddItem(NewSound, NewSound.TimeLength)
  }

  // Create the spark effect for the bullet impact
  makeParticleFX(position: Vector3, normal: Vector3) {
    // This is a trick I do with attachments all the time.
    // Parent attachments to the Terrain - It counts as a part, and setting position/rotation/etc. of it will be in world space.
    // UPD 11 JUNE 2019 - Attachments now have a "WorldPosition" value, but despite this, I still see it fit to parent attachments to terrain since its position never changes.
    const attachment = new Instance('Attachment')
    attachment.CFrame = new CFrame(position, position.add(normal))
    attachment.Parent = Workspace.Terrain

    const particle = this.instance.Handle.ImpactParticle.Clone()
    particle.Parent = attachment
    Debris.AddItem(attachment, particle.Lifetime.Max) // Automatically delete the particle effect after its maximum lifetime.

    // A potentially better option in favor of this would be to use the Emit method (Particle:Emit(numParticles)) though I prefer this since it adds some natural spacing between the particles.
    particle.Enabled = true
    wait(0.05)
    particle.Enabled = false
  }

  // Called when we want to fire the gun.
  fire(direction: Vector3) {
    if (!this.instance.Parent || this.instance.Parent.IsA('Backpack')) return // Can't fire if it's not equipped.
    // Note: Above isn't in the event as it will prevent the canFire value from being set as needed.

    // UPD. 11 JUNE 2019 - Add support for random angles.
    const directionalCF = new CFrame(new Vector3(), direction)
    // Now, we can use CFrame orientation to our advantage.
    // Overwrite the existing Direction value.
    direction = directionalCF.mul(
      CFrame.fromOrientation(0, 0, this.random.NextNumber(0, TAU)).mul(
        CFrame.fromOrientation(
          math.rad(
            this.random.NextNumber(
              MIN_BULLET_SPREAD_ANGLE,
              MAX_BULLET_SPREAD_ANGLE,
            ),
          ),
          0,
          0,
        ),
      ),
    ).LookVector

    // UPDATE V6: Proper bullet velocity!
    // IF YOU DON'T WANT YOUR BULLETS MOVING WITH YOUR CHARACTER, REMOVE THE THREE LINES OF CODE BELOW THIS COMMENT.
    // Requested by https://www.roblox.com/users/898618/profile/
    // We need to make sure the bullet inherits the velocity of the gun as it fires, just like in real life.
    const humanoidRootPart = this.instance.Parent.WaitForChild(
      'HumanoidRootPart',
      1,
    ) as BasePart // Add a timeout to this.
    const _myMovementSpeed = humanoidRootPart.Velocity // To do: It may be better to get this value on the clientside since the server will see this value differently due to ping and such.
    const modifiedBulletSpeed = direction.mul(BULLET_SPEED) // + myMovementSpeed // We multiply our direction unit by the bullet speed. This creates a Vector3 version of the bullet's velocity at the given speed. We then add MyMovementSpeed to add our body's motion to the velocity.

    const _simBullet = this.caster.Fire(
      this.instance.Handle.GunFirePoint.WorldPosition,
      direction,
      modifiedBulletSpeed,
      this.castBehavior,
    )
    // Optionally use some methods on simBullet here if applicable.

    // Play the sound
    this.playFireSound()
  }
}
