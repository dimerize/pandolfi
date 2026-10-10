export type HeadlightSample = {
  /** 0 at entry and 1 at exit. */
  progress: number;
  /** Smooth 0–1 intensity with no step or flash at either endpoint. */
  strength: number;
  /** A light source just below the photograph, in the scene's world units. */
  position: { x: number; y: number; z: number };
};

const FIRST_WAIT: [number, number] = [12, 18];
const LATER_WAIT: [number, number] = [70, 110];
const START_X = -3;
const END_X = 9;

/** Timing and position only; the host owns timers, visibility, and rendering. */
export class PassingHeadlights {
  readonly duration = 5.2;

  private state: number;
  private direction: 1 | -1;
  private passCount = 0;

  /** A supplied seed makes schedules reproducible for tests or previews. */
  constructor(seed = Date.now()) {
    this.state = (Number.isFinite(seed) ? seed : 0x9e3779b9) >>> 0;
    if (this.state === 0) this.state = 0x9e3779b9;
    this.direction = this.random() < 0.5 ? 1 : -1;
  }

  /** Call once when scheduling each pass. Returns visible wait in seconds. */
  nextDelay(): number {
    const [minimum, maximum] = this.passCount === 0 ? FIRST_WAIT : LATER_WAIT;
    if (this.passCount > 0) this.direction = this.direction === 1 ? -1 : 1;
    this.passCount++;
    return minimum + (maximum - minimum) * this.random();
  }

  /** Seconds since the scheduled pass began; safe before zero and after exit. */
  sample(elapsedSeconds: number): HeadlightSample {
    const elapsed = typeof elapsedSeconds === 'number' && !Number.isNaN(elapsedSeconds)
      ? elapsedSeconds : 0;
    const progress = Math.min(1, Math.max(0, elapsed / this.duration));
    const travel = this.direction === 1 ? progress : 1 - progress;
    const glow = Math.sin(Math.PI * progress);
    return {
      progress,
      strength: progress === 0 || progress === 1 ? 0 : glow * glow,
      position: { x: START_X + (END_X - START_X) * travel, y: -7.45, z: 0.75 },
    };
  }

  private random(): number {
    this.state = (Math.imul(this.state, 1664525) + 1013904223) >>> 0;
    return this.state / 0x100000000;
  }
}
