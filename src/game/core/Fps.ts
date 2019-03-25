export class Fps {
  public m_fps_time = 0;
  public m_fps_frames = 0;
  public m_fps = 0;
  public m_fps_div: HTMLDivElement;

  constructor() {
    const fps_div: HTMLDivElement = this.m_fps_div = document.body.appendChild(document.createElement('div'));
    fps_div.style.position = 'absolute';
    fps_div.style.right = '0px';
    fps_div.style.top = '0px';
    fps_div.style.backgroundColor = 'rgba(0,0,255,0.75)';
    fps_div.style.color = 'white';
    fps_div.style.font = '10pt Courier New';
    fps_div.style.zIndex = '256';
    fps_div.innerHTML = 'FPS';
  }

  public Update(time_elapsed: number): void {
    this.m_fps_time += time_elapsed;
    this.m_fps_frames++;

    if (this.m_fps_time >= 500) {
      this.m_fps = (this.m_fps_frames * 1000) / this.m_fps_time;
      this.m_fps_frames = 0;
      this.m_fps_time = 0;

      this.m_fps_div.innerHTML = this.m_fps.toFixed(1).toString();
    }
  }
}