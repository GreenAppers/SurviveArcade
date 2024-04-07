import { useSelector } from '@rbxts/react-reflex'
import Roact from '@rbxts/roact'
import { Alert } from 'StarterPlayer/StarterPlayerScripts/Gui/components/Alert'
import { selectAlerts } from 'StarterPlayer/StarterPlayerScripts/store'

export function Alerts() {
  const alerts = useSelector(selectAlerts)
  return (
    <>
      {alerts.map((alert, index) => (
        <Alert key={alert.id} alert={alert} index={index} />
      ))}
    </>
  )
}
