import { useSelector } from '@rbxts/react-reflex'
import Roact from '@rbxts/roact'

import { selectAlerts } from '../../store'
import { Alert } from './Alert'

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
