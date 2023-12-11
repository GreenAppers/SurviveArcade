import { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";

@Component({ tag: "Ball" })
export class MyComponent extends BaseComponent implements OnStart {
  onStart() {
    const ball = this.instance as BasePart;
    print(`Wow! I'm attached to ${this.instance.GetFullName()}`);
    ball.Touched?.Connect((part) => {
      const humanoid = part.Parent?.FindFirstChild("Humanoid") as
        | Humanoid
        | undefined;
      if (!humanoid) return;
      humanoid.Health = 0;
    });
  }
}
