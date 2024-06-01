import React, { Binding, forwardRef, InstanceEvent, InstanceChangeEvent, Ref } from '@rbxts/react'

export interface FrameProps<T extends Instance = Frame>
  extends React.PropsWithChildren {
  ref?: React.Ref<T>
  event?: InstanceEvent<T>
  change?: InstanceChangeEvent<T>
  size?: UDim2 | Binding<UDim2>
  position?: UDim2 | Binding<UDim2>
  anchorPoint?: Vector2 | Binding<Vector2>
  rotation?: number | Binding<number>
  backgroundColor?: Color3 | Binding<Color3>
  backgroundTransparency?: number | Binding<number>
  clipsDescendants?: boolean | Binding<boolean>
  visible?: boolean | Binding<boolean>
  zIndex?: number | Binding<number>
  layoutOrder?: number | Binding<number>
  cornerRadius?: UDim | Binding<UDim>
}

export const Frame = forwardRef((props: FrameProps, ref: Ref<Frame>) => {
  return (
    <frame
      ref={ref}
      Size={props.size}
      Position={props.position}
      AnchorPoint={props.anchorPoint}
      Rotation={props.rotation}
      BackgroundColor3={props.backgroundColor}
      BackgroundTransparency={props.backgroundTransparency}
      ClipsDescendants={props.clipsDescendants}
      Visible={props.visible}
      ZIndex={props.zIndex}
      LayoutOrder={props.layoutOrder}
      BorderSizePixel={0}
      Event={props.event}
      Change={props.change}
    >
      {props.cornerRadius && <uicorner CornerRadius={props.cornerRadius} />}
      {props.children}
    </frame>
  )
})
