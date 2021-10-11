import * as THREE from 'three';
import { computeRandomFromRange, computeRandomFromArr } from './lib';

class Props {
  constructor({ world, canvas, stage, height, width }) {
    const [min, max] = [Math.floor(width / 6), Math.floor(width / 3.5)];

    this.world = world;
    this.canvas = canvas;
    this.stage = stage;
    this.propSizeRange = [min, max];
    this.propHeight = Math.floor(max / 2);
    this.distanceRange = [Math.floor(min / 2), max * 2];
    this.colors = [0x67c23a, 0xe6a23c, 0xf56c6c, 0x909399, 0x409eff];
    this.directions = ['right', 'top'];
    this.props = [];
  }

  createProp() {
    const { props, propHeight, propSizeRange, colors } = this;
    const [min, max] = propSizeRange;
    const size = computeRandomFromRange(min, max);
    const color = computeRandomFromArr(colors);
    const boxGeometry = new THREE.BoxBufferGeometry(size, size, propHeight);
    const boxMetrial = new THREE.MeshLambertMaterial({ color });
    const box = new THREE.Mesh(boxGeometry, boxMetrial);
    box.castShadow = true;
    const [x, y] = this.getPropPosition(size);
    box.position.set(x, y, propHeight);
    this.enterAnimation(box);
    props.push(box);
    return box;
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
    const direction = computeRandomFromArr(directions);
    const currentProp = props[props?.length - 1];
    const currentSize = new THREE.Vector3();
    new THREE.Box3().setFromObject(currentProp).getSize(currentSize);
    const { x: currentX, y: currentY } = currentProp.position;
    if (direction === 'right') {
      const createX = currentX + currentSize?.x / 2 + distance + boxSize / 2;
      return [createX, currentY];
    } else if (direction === 'top') {
      const createY = currentY + currentSize?.y / 2 + distance + boxSize / 2;
      return [currentX, createY];
    }
  }

  enterAnimation(args) {
    let clock = new THREE.Clock();
    const name = `Box_${args.uuid}`;
    args.name = name;
    const { stage } = this;
    stage.add(args);
    const {
      position: { x, y, z },
    } = args;
    const times = [0, 1, 1.5, 2];
    const values = [z, z / 2, (z * 2) / 3, z / 2];
    const posTrack = new THREE.KeyframeTrack(`${name}.position[z]`, times, values);
    const duration = 2;
    const clip = new THREE.AnimationClip('down', duration, [posTrack]);
    const mixer = new THREE.AnimationMixer(args);
    const animationAction = mixer.clipAction(clip);
    animationAction.setLoop(THREE.LoopOnce);
    animationAction.clampWhenFinished = true;
    animationAction.timeScale = 5;
    animationAction.play();
    stage.render(mixer, clock);
    function render() {
      requestAnimationFrame(render);
      stage.render();
      mixer.update(clock.getDelta());
    }
    render();
  }
}

export default Props;
