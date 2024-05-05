import React from '@rbxts/react'
import { ReflexProvider } from '@rbxts/react-reflex'
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
      <RemProvider baseRem={baseRem} remOverride={remOverride}>
        {children}
      </RemProvider>
    </ReflexProvider>
  )
}
