import {
  useCamera,
  useDebounceState,
  useEventListener,
} from '@rbxts/pretty-react-hooks'
import React, { createContext, useEffect } from '@rbxts/react'
import {
  calculateRem,
  DEFAULT_REM,
  MIN_REM,
} from 'StarterPlayer/StarterPlayerScripts/fonts'

export interface RemProviderProps extends React.PropsWithChildren {
  baseRem?: number
  remOverride?: number
  minimumRem?: number
  maximumRem?: number
}

export const RemContext = createContext<number>(DEFAULT_REM)

export function RemProvider({
  baseRem = DEFAULT_REM,
  minimumRem = MIN_REM,
  maximumRem = math.huge,
  remOverride,
  children,
}: RemProviderProps) {
  const camera = useCamera()
  const [rem, setRem] = useDebounceState(baseRem, { wait: 0.2, leading: true })

  const update = () => {
    const viewport = camera.ViewportSize
    setRem(calculateRem(viewport, baseRem, minimumRem, maximumRem, remOverride))
  }

  useEventListener(camera.GetPropertyChangedSignal('ViewportSize'), update)

  useEffect(() => {
    update()
  }, [baseRem, minimumRem, maximumRem, remOverride])

  return <RemContext.Provider value={rem}>{children}</RemContext.Provider>
}
