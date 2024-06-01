import React, { Binding, InferEnumNames } from '@rbxts/react'
import { fonts } from 'StarterPlayer/StarterPlayerScripts/fonts'
import { FrameProps } from 'StarterPlayer/StarterPlayerScripts/Gui/components/Frame'
import { useRem } from 'StarterPlayer/StarterPlayerScripts/Gui/hooks'

export interface TextProps<T extends Instance = TextLabel>
  extends FrameProps<T> {
  font?: Font
  text?: string | Binding<string>
  textColor?: Color3 | Binding<Color3>
  textSize?: number | Binding<number>
  textTransparency?: number | Binding<number>
  textWrapped?: boolean | Binding<boolean>
  textXAlignment?: InferEnumNames<Enum.TextXAlignment>
  textYAlignment?: InferEnumNames<Enum.TextYAlignment>
  textTruncate?: InferEnumNames<Enum.TextTruncate>
  textScaled?: boolean | Binding<boolean>
  textHeight?: number | Binding<number>
  textAutoResize?: 'X' | 'Y' | 'XY'
  richText?: boolean | Binding<boolean>
  maxVisibleGraphemes?: number | Binding<number>
}

export function Text(props: TextProps) {
  const rem = useRem()

  return (
    <textlabel
      Font={Enum.Font.Unknown}
      FontFace={props.font || fonts.inter.regular}
      Text={props.text}
      TextColor3={props.textColor}
      TextSize={props.textSize ?? rem(1)}
      TextTransparency={props.textTransparency}
      TextWrapped={props.textWrapped}
      TextXAlignment={props.textXAlignment}
      TextYAlignment={props.textYAlignment}
      TextTruncate={props.textTruncate}
      TextScaled={props.textScaled}
      LineHeight={props.textHeight}
      RichText={props.richText}
      MaxVisibleGraphemes={props.maxVisibleGraphemes}
      Size={props.size}
      AutomaticSize={props.textAutoResize}
      Position={props.position}
      AnchorPoint={props.anchorPoint}
      BackgroundColor3={props.backgroundColor}
      BackgroundTransparency={props.backgroundTransparency ?? 1}
      ClipsDescendants={props.clipsDescendants}
      Visible={props.visible}
      ZIndex={props.zIndex}
      LayoutOrder={props.layoutOrder}
      Change={props.change}
      Event={props.event}
    >
      {props.cornerRadius && <uicorner CornerRadius={props.cornerRadius} />}
      {props.children}
    </textlabel>
  )
}
