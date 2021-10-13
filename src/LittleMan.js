import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import { animation } from './lib';

class LittleMan {
  constructor({ world, canvas, stage, props, height, width, color = 0x386899 }) {
    this.stage = stage;
    this.props = props;
    this.canvas = canvas;
    this.height = height;
    this.width = width;
    this.world = world;
    this.color = color;
    this.jumpAngle = Math.PI / 3;
    this.strength = 0;
    this.headerHeight = width * 0.25;
    this.G = 9.8;
    this.ratio = 1;
    this.animationFrameId = null;
    this.littleManMesh = null;
    this.littleManmaterial = null;
  }
  createLittleMan() {
    const { color } = this;
    this.material = new THREE.MeshStandardMaterial({ color });
    const littleManMesh = (this.littleManMesh = new THREE.Group());
    this.createLittleManHeader();
    this.createLittleManBody();
    return littleManMesh;
  }

  createLittleManHeader() {
    const { width, material, littleManMesh, headerHeight } = this;
    const headerGeo = new THREE.SphereGeometry(width * 0.04, 50, 50);
    const headerMesh = (this.headerMesh = new THREE.Mesh(headerGeo, material));
    headerMesh.position.set(0, 0, headerHeight);
    headerMesh.castShadow = true;
    littleManMesh.add(headerMesh);
  }

  createLittleManBody() {
    const { width, height, material, littleManMesh, stage } = this;
    const bodyBottomGeo = new THREE.CylinderGeometry(width * 0.03, width * 0.06, Math.floor((width * 3) / 21), 50, 50);
    bodyBottomGeo.translate(0, Math.floor((width * 3) / 42), 0);
    const bodyMidGeo = new THREE.CylinderGeometry(width * 0.04, width * 0.03, Math.floor(width / 21), 50, 50);
    bodyMidGeo.translate(0, Math.floor((width * 3) / 21), 0);
    const bodyTopGeo = new THREE.SphereGeometry(width * 0.04, 50, 50);
    bodyTopGeo.translate(0, Math.floor((width * 3) / 18), 0);
    const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries([bodyTopGeo, bodyMidGeo, bodyBottomGeo], false);
    mergedGeometry.rotateX(Math.PI / 2);
    const bodyMesh = (this.bodyMesh = new THREE.Mesh(mergedGeometry, material));
    bodyMesh.castShadow = true;
    const box = new THREE.Box3();
    const size = new THREE.Vector3();
    box.setFromObject(bodyMesh).getSize(size);
    this.littleManBodyHeight = size?.z || 0;
    littleManMesh.add(bodyMesh);
    stage.render();
  }

  enterStage() {
    const { stage, props } = this;
    const { littleManMesh } = this;
    littleManMesh.position.z = props.getPropHeight();
    stage.add(littleManMesh);
    this.bindEvent();
    stage.render();
  }

  pressLittleMan() {
    const { littleManMesh, bodyMesh, headerMesh, ratio, props, headerHeight } = this;
    const z = props.getPropHeight() * ratio;
    littleManMesh.position.z = z;
    bodyMesh.scale.set(1 + ratio / 10, 1 + ratio / 10, ratio);
    const box = new THREE.Box3();
    const size = new THREE.Vector3();
    box.setFromObject(bodyMesh).getSize(size);
    headerMesh.position.z = headerHeight - (this.littleManBodyHeight - size.z);
  }

  jump() {
    const { littleManMesh, props, headerHeight, headerMesh, bodyMesh } = this;
    littleManMesh.position.z = props.getPropHeight();
    headerMesh.position.z = headerHeight;
    bodyMesh.scale.set(1, 1, 1);
  }

  energyStorage() {
    const { props, stage } = this;
    const addPrower = () => {
      this.animationFrameId = requestAnimationFrame(addPrower);
      if (this.ratio <= 0.5) {
        cancelAnimationFrame(this.animationFrameId);
        return;
      }
      this.ratio = this.ratio - 0.008;
      this.pressLittleMan();
      props.pressProp(this.ratio);
      stage.render();
    };
    addPrower();
  }

  releasetorage() {
    cancelAnimationFrame(this.animationFrameId);
    const { props, stage, ratio } = this;
    const { prop, key, name } = props.loosenProp();
    this.jump();
    animation(prop, [{ key, name }], {
      duration: 2,
      times: [0, 0.5, 1, 1.5, 2],
      values: [ratio, 1.07, 0.95, 1.01, 1],
      onUpdate: () => {
        stage.render();
      },
      onComplete: () => {
        this.ratio = 1;
      },
    });
    props.createProp();
  }

  bindEvent() {
    let startTime;
    window.addEventListener('touchstart', () => {
      startTime = Number(new Date());
      this.energyStorage();
    });
    window.addEventListener('touchend', () => {
      let strength = Math.floor((Number(new Date()) - startTime) / 10);
      this.strength = strength > 140 ? 140 : strength;
      this.releasetorage();
    });
  }
}

export default LittleMan;
