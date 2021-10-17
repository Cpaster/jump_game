import * as THREE from 'three';
import { computeRandomFromRange, computeRandomFromArr, animation } from './lib';

class Props {
  constructor({ world, canvas, stage, height, width }) {
    const [min, max] = [Math.floor(width / 6), Math.floor(width / 3.5)];
    this.isInitStatus = null;
    this.animationFrameId = null;
    this.world = world;
    this.canvas = canvas;
    this.stage = null;
    this.scaleRatio = 1;
    this.propSizeRange = [min, max];
    this.propHeight = Math.floor(max / 2);
    this.distanceRange = [Math.floor(min / 2), max];
    this.colors = [0x67c23a, 0xe6a23c, 0xf56c6c, 0x909399, 0x409eff];
    this.directions = ['right', 'top'];
    this.props = [];
  }

  createProp(stage, val = null) {
    if (!this.stage) {
      this.stage = stage;
    }
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
    const [x, y] = this.computePropPosition(size);
    box.geometry.translate(0, 0, propHeight / 2);
    box.position.set(x, y, 0);
    props.push(box);
    return box;
  }

  pressProp(ratio) {
    let currentProp = this.getCurrentProp();
    currentProp.scale.set(1, 1, Number(ratio));
  }

  loosenProp() {
    let currentProp = this.getCurrentProp();
    return {
      key: 'scale[z]',
      prop: currentProp,
      name: `BoxLoose_${currentProp.uuid}`,
    };
  }

  computePropPosition(boxSize) {
    // 如果是props中没有元素则默认没有
    const { props } = this;
    if (!props?.length) {
      return [0, 0];
    }
    const { distanceRange, directions } = this;
    const [min, max] = distanceRange;
    const distance = computeRandomFromRange(min, max);
    const direction = (this.direction = this.isInitStatus ? 'right' : computeRandomFromArr(directions));
    const currentProp = props[props?.length - 1];
    const { x: currentX, y: currentY } = currentProp.position;
    const currentSize = new THREE.Vector3();
    new THREE.Box3().setFromObject(currentProp).getSize(currentSize);
    if (direction === 'right') {
      const createX = currentX + currentSize?.x / 2 + distance + boxSize / 2;
      return [createX, currentY];
    } else if (direction === 'top') {
      const createY = currentY + currentSize?.y / 2 + distance + boxSize / 2;
      return [currentX, createY];
    }
  }

  enterStage(args, onCompleted = () => {}) {
    const { stage, propHeight } = this;
    stage.add(args);
    if (this.isInitStatus) {
      args.position.z = 0;
      stage.render();
      return;
    }
    animation(
      args,
      [
        {
          key: 'position[z]',
          name: 'Box',
        },
      ],
      {
        duration: 5,
        times: [0, 1, 1.5, 2],
        values: [propHeight * 3, 0, propHeight / 6, 0],
        onUpdate: () => {
          stage.render();
        },
        onComplete: () => {
          stage.render();
          onCompleted && onCompleted();
        },
      }
    );
  }

  getPropHeight() {
    return this.propHeight;
  }

  getCurrentProp() {
    const { props } = this;
    const len = props?.length;
    console.log(len);
    return len <= 2 ? props[0] : props[len - 2];
  }

  // 获取下一个道具
  getNextProp() {
    const len = this.props?.length;
    let nextProp = len <= 2 && len > 0 ? this.props[1] : this.props[len - 1];
    return nextProp || null;
  }

  getNewCreateDirection() {
    return this.direction;
  }
}

export default Props;
