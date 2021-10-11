import Stage from './Stage.js';
import Props from './Props.js';

class JumpGame {
  constructor({ canvas, helper: { cameraHelpers = false, axesHelpers = false } }) {
    const { innerHeight, innerWidth } = window;
    this.canvas = canvas;
    this.cameraHelpers = cameraHelpers;
    this.axesHelpers = axesHelpers;
    this.width = innerWidth;
    this.height = innerHeight;
    this.init();
  }

  init() {
    // 初始化场景
    this.initStage();
    this.initProp();
  }

  initStage() {
    const { canvas, width, height, cameraHelpers, axesHelpers } = this;
    this.stage = new Stage({
      canvas,
      width,
      height,
      cameraHelpers,
      axesHelpers,
    });
  }

  initProp() {
    const { canvas, stage, width, height } = this;
    const props = (this.props = new Props({
      stage: this,
      canvas,
      stage,
      width,
      height,
    }));
    props.createProp();
    window.addEventListener('touchstart', (e) => {
      props.pressProp();
    })
    window.addEventListener('touchend', (e) => {
      props.loosenProp();
    })
  }
}

export default JumpGame;
