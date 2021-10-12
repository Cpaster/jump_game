import Stage from './Stage.js';
import Props from './Props.js';
import LittleMan from './LittleMan.js';

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
    this.ininLittleMan();
    this.start();
  }

  start() {
    const {props, littleMan} = this;
    props.createProp(0);
    props.createProp(0);
    littleMan.createLittleMan();
    littleMan.enterStage();
    this.bindEvent();
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
      world: this,
      canvas,
      stage,
      width,
      height,
    }));
    // props.createProp();
  }

  ininLittleMan() {
    const { canvas, stage, width, height } = this;
    this.littleMan = new LittleMan({
      canvas,
      stage,
      width,
      height,
    });
  }

  bindEvent() {
    const { props } = this;
    window.addEventListener('touchstart', e => {
      props.pressProp();
    });
    window.addEventListener('touchend', e => {
      props.loosenProp();
      props.createProp();
    });
  }
}

export default JumpGame;
