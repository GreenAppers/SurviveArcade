import { OnStart, Service } from '@flamework/core'
import { ProximityPromptService } from '@rbxts/services'

@Service()
export class ProximityService implements OnStart {
  onStart() {
    ProximityPromptService.PromptTriggered.Connect((promptObject, player) => {
      print('proximity trigger', promptObject, player)
    })
  }
}
