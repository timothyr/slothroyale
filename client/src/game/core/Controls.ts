import { Input, MoveX, MoveY } from 'gamecommon/game/core/InputTypes';

export class Controls {

  public input: Input;
  private left = false;
  private right = false;
  private up = false;
  private down = false;

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
        this.left = isPressed;

        if (isPressed) {
          this.input.moveX = MoveX.LEFT;
        } else {
          if (this.right) {
            this.input.moveX = MoveX.RIGHT;
          } else {
            this.input.moveX = MoveX.NONE;
          }
        }
        break;
      case 'ArrowRight':
        this.right = isPressed;

        if (isPressed) {
          this.input.moveX = MoveX.RIGHT;
        } else {
          if (this.left) {
            this.input.moveX = MoveX.LEFT;
          } else {
            this.input.moveX = MoveX.NONE;
          }
        }
        break;
      case 'ArrowDown':
        this.down = isPressed;

        if (isPressed) {
          this.input.moveY = MoveY.DOWN;
        } else {
          if (this.up) {
            this.input.moveY = MoveY.UP;
          } else {
            this.input.moveY = MoveY.NONE;
          }
        }
        break;
      case 'ArrowUp':
        this.up = isPressed;

        if (isPressed) {
          this.input.moveY = MoveY.UP;
        } else {
          if (this.down) {
            this.input.moveY = MoveY.DOWN;
          } else {
            this.input.moveY = MoveY.NONE;
          }
        }
        break;
    }
  }
}

