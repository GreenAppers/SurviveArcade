import Object from '@rbxts/object-utils'
import React, { useState } from '@rbxts/react'
import { useSelector } from '@rbxts/react-reflex'
import { selectPlayersState } from 'ReplicatedStorage/shared/state'
import {
  selectIsPlayerListOpen,
  store,
} from 'StarterPlayer/StarterPlayerScripts/store'

const CloseButton = () => (
  <frame
    key="TopRoundedRect"
    BackgroundTransparency={1}
    ClipsDescendants={true}
    Size={new UDim2(1, 0, 0, 18)}
  >
    <frame
      key="CloseButton"
      BackgroundColor3={Color3.fromRGB(0, 0, 0)}
      BackgroundTransparency={0.3}
      Size={new UDim2(1, 0, 0, 36)}
    >
      <uicorner CornerRadius={new UDim(0, 7)} />
      <imagebutton
        AutoButtonColor={false}
        BackgroundTransparency={1}
        Position={UDim2.fromOffset(1, 1)}
        Size={UDim2.fromOffset(20, 20)}
        Event={{ Activated: () => store.setPlayerList(false) }}
      >
        <uisizeconstraint MinSize={new Vector2(16, 16)} />
        <imagelabel
          Image={
            'rbxasset://LuaPackages/Packages/_Index/UIBlox/UIBlox/AppImageAtlas/img_set_2x_14.png'
          }
          ImageRectOffset={new Vector2(222, 396)}
          ImageRectSize={new Vector2(72, 72)}
          AnchorPoint={new Vector2(0.5, 0.5)}
          BackgroundTransparency={1}
          Position={UDim2.fromScale(0.5, 0.5)}
          Size={UDim2.fromOffset(16, 16)}
        />
      </imagebutton>
    </frame>
  </frame>
)

const PlayerName = (props: {
  Font?: Font
  Offset?: UDim2
  Size?: UDim2
  Text?: string
}) => (
  <frame key="NameFrame" BackgroundTransparency={1} Size={props.Size}>
    <textbutton
      key="BGFrame"
      Text={''}
      AutoButtonColor={false}
      BackgroundColor3={Color3.fromRGB(0, 0, 0)}
      BackgroundTransparency={1}
      BorderSizePixel={0}
      Size={props.Size}
      AutoLocalize={false}
    >
      <imagelabel
        key="PlayerIcon"
        BackgroundTransparency={1}
        BorderSizePixel={0}
        Size={UDim2.fromOffset(16, 16)}
      />
      <frame key="PlayerName" BackgroundTransparency={1} Size={props.Offset}>
        <uipadding key="InitalPadding" PaddingLeft={new UDim(0, 12)} />
        <uilistlayout
          Padding={new UDim(0, 4)}
          FillDirection={Enum.FillDirection.Horizontal}
          SortOrder={Enum.SortOrder.LayoutOrder}
          VerticalAlignment={Enum.VerticalAlignment.Center}
        />
        <textlabel
          FontFace={props.Font}
          Text={props.Text}
          TextColor3={Color3.fromRGB(255, 255, 255)}
          TextScaled={true}
          TextSize={15}
          TextTruncate={Enum.TextTruncate.AtEnd}
          TextWrapped={true}
          TextXAlignment={Enum.TextXAlignment.Left}
          AutomaticSize={Enum.AutomaticSize.X}
          BackgroundTransparency={1}
          Size={UDim2.fromScale(0, 1)}
        >
          <uitextsizeconstraint MaxTextSize={15} MinTextSize={10} />
        </textlabel>
      </frame>
    </textbutton>
    <imagelabel
      key="Shadow"
      Image={'rbxasset://textures/ui/PlayerList/TileShadowMissingTop.png'}
      ScaleType={Enum.ScaleType.Slice}
      SliceCenter={new Rect(6, 6, 9, 9)}
      BackgroundTransparency={1}
      Position={UDim2.fromOffset(-5, 0)}
      Size={new UDim2(1, 10, 1, 5)}
      Visible={false}
    />
  </frame>
)

const PlayerStat = (props: {
  Font?: Font
  Name?: string
  Size?: UDim2
  Value?: string | number
}) => (
  <textbutton
    key={`PlayerStat_${props.Name}`}
    Text={''}
    AutoButtonColor={false}
    BackgroundColor3={Color3.fromRGB(0, 0, 0)}
    BackgroundTransparency={1}
    BorderSizePixel={0}
    Selectable={false}
    Size={props.Size}
    AutoLocalize={false}
  >
    <textlabel
      key={'StatText'}
      FontFace={props.Font}
      Text={`${props.Value}`}
      TextColor3={Color3.fromRGB(255, 255, 255)}
      TextSize={15}
      TextTruncate={Enum.TextTruncate.AtEnd}
      Active={true}
      BackgroundTransparency={1}
      Size={UDim2.fromScale(1, 1)}
    >
      <uipadding PaddingLeft={new UDim(0, 4)} />
    </textlabel>
  </textbutton>
)

const TitleColumn = (props: {
  Font?: Font
  PaddingLeft?: UDim
  Text?: string
  TextTruncate?: Enum.TextTruncate
  TextXAlignment?: Enum.TextXAlignment
  Size?: UDim2
}) => (
  <textlabel
    BackgroundTransparency={1}
    FontFace={props.Font}
    Size={props.Size}
    Text={props.Text}
    TextColor3={Color3.fromRGB(255, 255, 255)}
    TextSize={12}
    TextTransparency={0.3}
    TextTruncate={props.TextTruncate}
    TextXAlignment={props.TextXAlignment}
  >
    {props.PaddingLeft && <uipadding PaddingLeft={new UDim(0, 15)} />}
  </textlabel>
)

export function PlayerList() {
  const maxShowPlayers = 5.8
  const showPlayerHeight = 40
  const showPlayerColumnWidths = [183, 66, 66, 66]
  const font = new Font(
    'rbxasset://fonts/families/BuilderSans.json',
    Enum.FontWeight.Medium,
    Enum.FontStyle.Normal,
  )
  const [hoverIndex, setHoverIndex] = useState(-1)
  const playerListOpen = useSelector(selectIsPlayerListOpen)
  const playersState = useSelector(selectPlayersState())
  const players = Object.values(playersState ?? {})
  const showPlayers = math.min(players.size() || 1, maxShowPlayers)
  const showPlayerListHeight = showPlayerHeight * showPlayers
  const totalPlayerListHeight = showPlayerHeight * players.size()

  return !playerListOpen ? (
    <></>
  ) : (
    <frame
      key="PlayerListMaster"
      AnchorPoint={new Vector2(1, 0)}
      BackgroundTransparency={1}
      Position={new UDim2(1, -4, 0, 62)}
      Size={new UDim2(0, 397, 0.5, 0)}
      AutoLocalize={false}
    >
      <frame
        key="PlayerScrollList"
        BackgroundTransparency={1}
        Size={new UDim2(1, -1, 1, 0)}
      >
        <frame
          key="SizeOffsetFrame"
          AnchorPoint={new Vector2(0.5, 0.5)}
          BackgroundTransparency={1}
          Position={UDim2.fromScale(0.5, 0.5)}
          Size={UDim2.fromScale(1, 1)}
        >
          <CloseButton />
          <uiscale />
          <uilistlayout SortOrder={Enum.SortOrder.LayoutOrder} />
          <frame
            key="TitleBar"
            BackgroundColor3={Color3.fromRGB(0, 0, 0)}
            BackgroundTransparency={0.3}
            BorderSizePixel={0}
            Size={new UDim2(1, 0, 0, 20)}
          >
            <frame
              key="Divider"
              AnchorPoint={new Vector2(0, 1)}
              BackgroundColor3={Color3.fromRGB(255, 255, 255)}
              BackgroundTransparency={0.8}
              BorderSizePixel={0}
              Position={UDim2.fromScale(0, 1)}
              Size={new UDim2(1, 0, 0, 1)}
            />
            <frame
              key="Content"
              BackgroundTransparency={1}
              Position={UDim2.fromOffset(0, -2)}
              Size={UDim2.fromScale(1, 1)}
            >
              <uilistlayout
                FillDirection={Enum.FillDirection.Horizontal}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
              />
              <TitleColumn
                Font={font}
                Text={'People'}
                Size={new UDim2(0, showPlayerColumnWidths[0], 1, 0)}
                TextXAlignment={Enum.TextXAlignment.Left}
                PaddingLeft={new UDim(0, 15)}
              />
              <TitleColumn
                Font={font}
                Text={'🎟️ Tickets'}
                TextTruncate={Enum.TextTruncate.AtEnd}
                Size={new UDim2(0, showPlayerColumnWidths[1], 1, 0)}
              />
              <TitleColumn
                Font={font}
                Text={'💵 Dollars'}
                TextTruncate={Enum.TextTruncate.AtEnd}
                Size={new UDim2(0, showPlayerColumnWidths[2], 1, 0)}
              />
              <TitleColumn
                Font={font}
                Text={'✨ Levity'}
                TextTruncate={Enum.TextTruncate.AtEnd}
                Size={new UDim2(0, showPlayerColumnWidths[3], 1, 0)}
              />
            </frame>
          </frame>
          <frame
            key="ScrollingFrameContainer"
            BackgroundColor3={Color3.fromRGB(0, 0, 0)}
            BackgroundTransparency={0.3}
            BorderSizePixel={0}
            Size={new UDim2(1, 0, 0, showPlayerListHeight)}
          >
            <frame
              key="ScrollingFrameClippingFrame"
              BackgroundTransparency={1}
              ClipsDescendants={true}
              Size={UDim2.fromScale(1, 1)}
            >
              <scrollingframe
                CanvasSize={UDim2.fromOffset(0, totalPlayerListHeight)}
                ScrollBarImageColor3={Color3.fromRGB(216, 216, 216)}
                ScrollBarImageTransparency={0.5}
                ScrollBarThickness={8}
                VerticalScrollBarInset={Enum.ScrollBarInset.Always}
                BackgroundTransparency={1}
                BorderSizePixel={0}
                ClipsDescendants={false}
                Selectable={false}
                Size={new UDim2(1, -4, 1, 0)}
              >
                <frame
                  key="OffsetUndoFrame"
                  BackgroundTransparency={1}
                  Size={new UDim2(1, 12, 0, showPlayerListHeight)}
                >
                  {Object.values(playersState).map((player, i) => (
                    <frame
                      BackgroundColor3={Color3.fromRGB(255, 255, 255)}
                      BackgroundTransparency={i === hoverIndex ? 0.6 : 1}
                      Size={new UDim2(1, 0, 0, showPlayerHeight)}
                      Position={UDim2.fromOffset(0, i * showPlayerHeight)}
                      Event={{
                        MouseEnter: () => setHoverIndex(i),
                        MouseLeave: () =>
                          setHoverIndex((oldIndex) =>
                            oldIndex === i ? -1 : oldIndex,
                          ),
                      }}
                    >
                      <frame
                        key="Content"
                        BackgroundTransparency={1}
                        Size={UDim2.fromScale(1, 1)}
                      >
                        <uilistlayout
                          FillDirection={Enum.FillDirection.Horizontal}
                          SortOrder={Enum.SortOrder.LayoutOrder}
                          VerticalAlignment={Enum.VerticalAlignment.Center}
                        />
                        <PlayerName
                          Font={font}
                          Text={player.name}
                          Size={UDim2.fromOffset(
                            showPlayerColumnWidths[0],
                            showPlayerHeight,
                          )}
                          Offset={new UDim2(1, -34, 1, 0)}
                        />
                        <PlayerStat
                          Font={font}
                          Name="Tickets"
                          Value={player.tickets}
                          Size={new UDim2(0, showPlayerColumnWidths[1], 1, 0)}
                        />
                        <PlayerStat
                          Font={font}
                          Name="Dollars"
                          Value={player.dollars}
                          Size={new UDim2(0, showPlayerColumnWidths[2], 1, 0)}
                        />
                        <PlayerStat
                          Font={font}
                          Name="Levity"
                          Value={player.levity}
                          Size={new UDim2(0, showPlayerColumnWidths[3], 1, 0)}
                        />
                      </frame>
                    </frame>
                  ))}
                </frame>
              </scrollingframe>
            </frame>
          </frame>
          <frame
            key="BottomRoundedRect"
            BackgroundTransparency={1}
            BorderSizePixel={0}
            ClipsDescendants={true}
            Size={new UDim2(1, 0, 0, 7)}
          >
            <frame
              BackgroundColor3={Color3.fromRGB(0, 0, 0)}
              BackgroundTransparency={0.3}
              BorderSizePixel={0}
              Position={UDim2.fromOffset(0, -8)}
              Size={new UDim2(1, 0, 0, 14)}
            >
              <uicorner CornerRadius={new UDim(0, 7)} />
            </frame>
          </frame>
        </frame>
      </frame>

      <uisizeconstraint MaxSize={new Vector2(math.huge, 312)} />
    </frame>
  )
}
