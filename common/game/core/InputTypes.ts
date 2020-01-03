export enum MoveX {
    NONE,
    LEFT,
    RIGHT
}

export enum MoveY {
    NONE,
    UP,
    DOWN
}

export class Input {
    moveX: MoveX = MoveX.NONE;
    moveY: MoveY = MoveY.NONE;
    jump: boolean;
    fire: boolean;
}
