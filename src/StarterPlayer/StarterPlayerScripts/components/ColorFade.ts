import { BaseComponent, Component } from '@flamework/components'
import { OnStart } from '@flamework/core'
import { TweenService } from '@rbxts/services'
import { ColorFadeTag } from 'ReplicatedStorage/shared/constants/tags'

@Component({ tag: ColorFadeTag })
export class ColorFadeComponent
  extends BaseComponent<{}, BasePart>
  implements OnStart
{
  onStart() {
    const numberValue = new Instance('NumberValue')
    numberValue.Changed.Connect(() => {
      this.instance.Color = Color3.fromHSV(numberValue.Value, 1, 1)
    })
    const tweenInfo = new TweenInfo(10, Enum.EasingStyle.Linear)
    const tween = TweenService.Create(numberValue, tweenInfo, { Value: 1 })
    for (;;) {
      tween.Play()
      tween.Completed.Wait()
      numberValue.Value = 0
    }
  }
}
