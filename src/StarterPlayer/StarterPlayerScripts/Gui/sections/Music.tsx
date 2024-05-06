import { useEventListener } from '@rbxts/pretty-react-hooks'
import React, { useEffect, useState } from '@rbxts/react'
import { useSelector } from '@rbxts/react-reflex'
import { createSound } from 'ReplicatedStorage/shared/assets/sounds'
import { selectLocalPlayerMusicEnabled } from 'ReplicatedStorage/shared/state'
import { shuffle } from 'ReplicatedStorage/shared/utils/object'

const MUSIC = [
  'rbxassetid://1840144028', // Machinerama
]

export function Music() {
  const enabled = useSelector(selectLocalPlayerMusicEnabled())

  const [queue, setQueue] = useState(() => shuffle(MUSIC))
  const [index, setIndex] = useState(0)
  const [sound, setSound] = useState<Sound>()

  // Advance the queue when the song ends
  useEventListener(sound?.Ended, () => {
    setIndex(index + 1)
  })

  // Create the next song when the index changes
  useEffect(() => {
    if (index >= queue.size()) {
      // Shuffle the queue if we've reached the end
      setQueue(shuffle(MUSIC))
      setIndex(0)
      return
    }

    const newSound = createSound(queue[index], { volume: 0.2 })

    setSound(newSound)

    return () => {
      newSound.Destroy()
    }
  }, [index])

  // Pause/resume the sound when the enabled state changes
  // or when the sound changes
  useEffect(() => {
    if (enabled) {
      sound?.Resume()
    } else {
      sound?.Pause()
    }
  }, [enabled, sound])

  // Destroy sounds not in use
  useEffect(() => {
    return () => {
      sound?.Destroy()
    }
  }, [sound])

  return <></>
}
