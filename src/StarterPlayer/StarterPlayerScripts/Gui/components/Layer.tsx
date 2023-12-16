import Roact from '@rbxts/roact'

interface LayerProps {
  displayOrder?: number
  children?: Roact.Children
}

export function Layer({ displayOrder, children }: LayerProps) {
  return (
    <screengui
      DisplayOrder={displayOrder}
      IgnoreGuiInset
      ResetOnSpawn={false}
      ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
    >
      {children}
    </screengui>
  )
}
