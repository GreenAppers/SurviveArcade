import Roact, { useEffect, useState } from '@rbxts/roact'

export function Status() {
  const [score, setScore] = useState(0)
  useEffect(() => {
    const localPlayer = game.GetService('Players').LocalPlayer
    const leaderstats = localPlayer?.WaitForChild('leaderstats') as unknown as
      | {
          Score: IntValue
        }
      | undefined
    const scoreValue = leaderstats?.Score
    if (!scoreValue) return
    const connection = scoreValue.Changed.Connect((value) => setScore(value))
    return () => connection.Disconnect()
  }, [])
  return <textlabel Text={`Score: ${score}`} />
}
