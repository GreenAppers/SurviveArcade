import React from '@rbxts/react'
import { IS_EDIT } from 'ReplicatedStorage/shared/constants/core'
import { Group } from 'StarterPlayer/StarterPlayerScripts/Gui/components/Group'

interface LayerProps extends React.PropsWithChildren {
  displayOrder?: number
}

export function Layer({ displayOrder, children }: LayerProps) {
  return IS_EDIT ? (
    <Group zIndex={displayOrder}>{children}</Group>
  ) : (
    <screengui
      ResetOnSpawn={false}
      DisplayOrder={displayOrder}
      IgnoreGuiInset
      ZIndexBehavior="Sibling"
    >
      {children}
    </screengui>
  )
}
