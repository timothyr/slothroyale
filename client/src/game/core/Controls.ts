import { Input, MoveX, MoveY } from 'gamecommon/game/core/InputTypes';

export class Controls {

  public input: Input;

  constructor(input: Input) {
    this.input = input;
    this.SetupControls();
  }

  public SetupControls(): void {
    window.addEventListener('keydown', (e: KeyboardEvent): void => { this.HandleKey(e, true); });
    window.addEventListener('keyup', (e: KeyboardEvent): void => { this.HandleKey(e, false); });
  }

  public HandleKey(e: KeyboardEvent, isPressed: boolean): void {
    switch (e.key) {
      case ' ':
        this.input.fire = isPressed;
        break;
      case 'Control':

        break;
      case 'Shift':
        this.input.jump = isPressed;
        break;
      case 'ArrowLeft':
        if (isPressed) {
          this.input.moveX = MoveX.LEFT;
        } else {
          this.input.moveX = MoveX.NONE;
        }
        break;
      case 'ArrowRight':
        if (isPressed) {
          this.input.moveX = MoveX.RIGHT;
        } else {
          this.input.moveX = MoveX.NONE;
        }
        break;
      case 'ArrowDown':
        if (isPressed) {
          this.input.moveY = MoveY.DOWN;
        } else {
          this.input.moveY = MoveY.NONE;
        }
        break;
      case 'ArrowUp':
        if (isPressed) {
          this.input.moveY = MoveY.UP;
        } else {
          this.input.moveY = MoveY.NONE;
        }
        break;
    }
  }
}

