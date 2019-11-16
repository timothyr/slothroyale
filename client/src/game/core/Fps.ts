export class Fps {
  public fpsTime = 0;
  public fpsFrames = 0;
  public fps = 0;
  public fpsDiv: HTMLDivElement;

  constructor() {
    this.fpsDiv = document.body.appendChild(document.createElement('div'));
    this.fpsDiv.style.position = 'absolute';
    this.fpsDiv.style.right = '0px';
    this.fpsDiv.style.top = '0px';
    this.fpsDiv.style.backgroundColor = 'rgba(0,0,255,0.75)';
    this.fpsDiv.style.color = 'white';
    this.fpsDiv.style.font = '10pt Courier New';
    this.fpsDiv.style.zIndex = '256';
    this.fpsDiv.innerHTML = 'FPS';
  }

  public Update(timeElapsed: number): void {
    this.fpsTime += timeElapsed;
    this.fpsFrames++;

    if (this.fpsTime >= 500) {
      this.fps = (this.fpsFrames * 1000) / this.fpsTime;
      this.fpsFrames = 0;
      this.fpsTime = 0;

      this.fpsDiv.innerHTML = this.fps.toFixed(1).toString();
    }
  }
}
