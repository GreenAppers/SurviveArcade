import { SoundService } from '@rbxts/services'

export interface SoundOptions {
  volume?: number
  speed?: number
  looped?: boolean
  parent?: Instance
}

export function createSound(
  soundId: string,
  {
    volume = 0.5,
    speed = 1,
    looped = false,
    parent = SoundService,
  }: SoundOptions = {},
) {
  const sound = new Instance('Sound')
  sound.SoundId = soundId
  sound.Volume = volume
  sound.PlaybackSpeed = speed
  sound.Looped = looped
  sound.Parent = parent
  return sound
}

export function playSound(soundId: string, options?: SoundOptions) {
  const sound = createSound(soundId, options)
  sound.Ended.Connect(() => sound.Destroy())
  sound.Play()
  return sound
}

export function playSoundId(object: Instance, soundId: string) {
  let sound = object.FindFirstChild<Sound>('Sound')
  if (sound) {
    sound.Play()
  } else {
    sound = new Instance('Sound')
    sound.SoundId = soundId
    sound.Parent = object
    sound.Play()
  }
}
