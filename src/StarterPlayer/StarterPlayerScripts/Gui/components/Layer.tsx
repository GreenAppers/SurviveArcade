import Roact from '@rbxts/roact'
import { IS_EDIT } from 'ReplicatedStorage/shared/constants/core'

import { Group } from './Group'

interface LayerProps extends Roact.PropsWithChildren {
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
