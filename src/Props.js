import * as THREE from 'three';
import { computeRandomFromRange, computeRandomFromArr, animation } from './lib';

class Props {
  constructor({ world, canvas, stage, height, width }) {
    const [min, max] = [Math.floor(width / 6), Math.floor(width / 3.5)];
    this.isInitStatus = null;
    this.animationFrameId = null;
    this.world = world;
    this.canvas = canvas;
    this.stage = stage;
    this.scaleRatio = 1;
    this.propSizeRange = [min, max];
    this.propHeight = Math.floor(max / 2);
    this.distanceRange = [Math.floor(min / 2), max];
    this.colors = [0x67c23a, 0xe6a23c, 0xf56c6c, 0x909399, 0x409eff];
    this.directions = ['right', 'top'];
    this.props = [];
  }

  createProp(val = null) {
    this.isInitStatus = val === 0;
    const { props, propHeight, propSizeRange, colors } = this;
    const [min, max] = propSizeRange;
    const size = this.isInitStatus ? max : computeRandomFromRange(min, max);
    const color = this.isInitStatus ? colors[0] : computeRandomFromArr(colors);
    const boxGeometry = new THREE.BoxBufferGeometry(size, size, propHeight);
    const boxMetrial = new THREE.MeshLambertMaterial({ color });
    const box = new THREE.Mesh(boxGeometry, boxMetrial);
    box.castShadow = true;
    box.receiveShadow = true;
    const [x, y] = this.getPropPosition(size);
    box.geometry.translate(x, y, propHeight / 2);
    box.position.set(x, y, 0);
    this.enterStage(box);
    props.push(box);
    return box;
  }

  pressProp() {
    const { props, stage } = this;
    const len = props?.length;
    let currentProp = len <= 2 ? props[0] : props[len - 2];
    const scaleHeight = () => {
      this.animationFrameId = requestAnimationFrame(scaleHeight);
      if (this.scaleRatio <= 0.4) {
        cancelAnimationFrame(this.animationFrameId);
        return;
      }
      this.scaleRatio = this.scaleRatio - 0.008;
      currentProp.scale.set(1, 1, this.scaleRatio);
      stage.render();
    };
    scaleHeight();
  }

  loosenProp() {
    cancelAnimationFrame(this.animationFrameId);
    const { props, stage, scaleRatio } = this;
    const len = props?.length;
    let currentProp = len <= 2 ? props[0] : props[len - 2];
    animation('scale[z]', {
      prop: currentProp,
      name: 'BoxLoose',
      duration: 2,
      times: [0, 0.5, 1, 1.5, 2],
      values: [scaleRatio, 1.07, 0.95, 1.01, 1],
      onUpdate: () => {
        stage.render();
      },
      onComplete: () => {
        this.scaleRatio = 1;
      },
    });
  }

  getPropPosition(boxSize) {
    // 如果是props中没有元素则默认没有
    const { props } = this;
    if (!props?.length) {
      return [0, 0];
    }
    const { distanceRange, directions } = this;
    const [min, max] = distanceRange;
    const distance = computeRandomFromRange(min, max);
    const direction = this.isInitStatus ? 'right' : computeRandomFromArr(directions);
    const currentProp = props[props?.length - 1];
    const currentSize = new THREE.Vector3();
    new THREE.Box3().setFromObject(currentProp).getSize(currentSize);
    const { x: currentX, y: currentY } = currentProp.position;
    if (direction === 'right') {
      const createX = currentX + distance + boxSize / 2;
      return [createX, currentY];
    } else if (direction === 'top') {
      const createY = currentY + distance + boxSize / 2;
      return [currentX, createY];
    }
  }

  enterStage(args) {
    const { stage, propHeight } = this;
    stage.add(args);
    if (this.isInitStatus) {
      args.position.z = 0;
      stage.render();
      return;
    }
    animation('position[z]', {
      prop: args,
      name: 'Box',
      duration: 2,
      times: [0, 1, 1.5, 2],
      values: [propHeight * 3, 0, propHeight / 6, 0],
      onUpdate: () => {
        stage.render();
      },
      onComplete: () => {},
    });
  }
}

export default Props;
