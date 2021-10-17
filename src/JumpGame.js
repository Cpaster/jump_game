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
    this.initProp();
    this.ininLittleMan();
    this.initStage();
  }

  start() {
    const { props, littleMan, stage } = this;
    props.enterStage(props.createProp(stage, 0));
    props.enterStage(props.createProp(stage, 0));
    stage.moveCamera(0);
    littleMan.createLittleMan();
    littleMan.enterStage(stage);
  }

  initStage() {
    const { canvas, width, height, cameraHelpers, axesHelpers, props } = this;
    this.stage = new Stage({
      canvas,
      width,
      height,
      props,
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
  }

  ininLittleMan() {
    const { canvas, stage, width, height, props } = this;
    this.littleMan = new LittleMan({
      canvas,
      stage,
      props,
      width,
      height,
    });
  }
}

export default JumpGame;
