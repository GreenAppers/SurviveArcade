import { ReflexProvider } from '@rbxts/react-reflex'
import Roact from '@rbxts/roact'
import {
  RemProvider,
  RemProviderProps,
} from 'StarterPlayer/StarterPlayerScripts/Gui/providers/RemProvider'
import { store } from 'StarterPlayer/StarterPlayerScripts/store'

interface RootProviderProps extends RemProviderProps {}

export function RootProvider({
  baseRem,
  remOverride,
  children,
}: RootProviderProps) {
  return (
    <ReflexProvider producer={store}>
      <RemProvider
        key="rem-provider"
        baseRem={baseRem}
        remOverride={remOverride}
      >
        {children}
      </RemProvider>
    </ReflexProvider>
  )
}
