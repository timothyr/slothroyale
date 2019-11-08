export enum MoveX {
    LEFT,
    RIGHT,
    NONE
}

export enum MoveY {
    UP,
    DOWN,
    NONE
}

export class Input {
    moveX: MoveX = MoveX.NONE;
    moveY: MoveY = MoveY.NONE;
    jump: boolean;
    fire: boolean;
}
