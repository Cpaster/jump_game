class Timing {
  constructor({ duration, iterations = 1, easing = p => p }) {
    this.startTime = Number(new Date());
    this.duration = duration;
    this.iterations = iterations;
    this.easing = easing;
  }
  get time() {
    return Number(new Date()) - this.startTime;
  }
  get p() {
    const progress = Math.min(this.time / this.duration, this.iterations);
    return this.isFinish ? 1 : this.easing(progress % 1);
  }

  get isFinish() {
    return this.time / this.duration >= this.iterations;
  }
}

export class Animation {
  constructor({ duration, iterations, easing = p => p }) {
    this.timing = { duration, iterations, easing };
    this.requestAnimationFrameId = null;
  }

  animate(target, update) {
    let frameIndex = 0;
    const timing = new Timing(this.timing);
    return new Promise(resolve => {
      const next = () => {
        if (update({ target, frameIndex, timing }) !== false && !timing.isFinish) {
          this.requestAnimationFrameId = requestAnimationFrame(next);
        } else {
          cancelAnimationFrame(this.requestAnimationFrameId);
          resolve(timing);
        }
        frameIndex = frameIndex + 0.03;
      };
      next();
    });
  }
}
