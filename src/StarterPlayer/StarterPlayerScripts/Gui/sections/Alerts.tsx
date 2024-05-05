import React from '@rbxts/react'
import { useSelector } from '@rbxts/react-reflex'
import { Alert } from 'StarterPlayer/StarterPlayerScripts/Gui/components/Alert'
import { selectAlerts } from 'StarterPlayer/StarterPlayerScripts/store'

export function Alerts() {
  const alerts = useSelector(selectAlerts)
  return (
    <>
      {alerts.map((alert, index) => (
        <Alert alert={alert} index={index} />
      ))}
    </>
  )
}
