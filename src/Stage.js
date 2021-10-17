import * as THREE from 'three';
import { resizeRendererToDisplaySize } from './lib';
import { Animation } from './lib/animation';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class Stage {
  constructor({ canvas, width, height, props, cameraHelpers, axesHelpers }) {
    this.canvas = canvas;
    this.height = height;
    this.width = width;
    this.props = props;
    this.axesHelpers = axesHelpers;
    this.cameraHelpers = cameraHelpers;
    this.renderer = null;
    this.orbitControl = null;
    this.camera = null;
    this.scene = null;
    this.plane = null;
    this.renderRequested = false;
    this.init();
  }

  init() {
    this.createWebGlRender();
    this.createScene();
    this.createCamera();
    this.createPlane();
    this.createLight();
    this.render();
    this.bindEvent();
  }

  createScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    this.scene = scene;
    if (this.axesHelpers) {
      scene.add(new THREE.AxesHelper(100));
    }
  }

  createLight() {
    const { scene } = this;
    const light = new THREE.DirectionalLight(0xffffff, 0.9);
    light.position.set(300, -300, 400);
    scene.add(light);
    light.castShadow = true;
    light.shadow.camera.left = -400;
    light.shadow.camera.right = 400;
    light.shadow.camera.top = 400;
    light.shadow.camera.bottom = -400;
    light.shadow.camera.near = 0;
    light.shadow.camera.far = 1000;
    light.shadow.mapSize.width = 1600;
    light.shadow.mapSize.height = 1600;
    const lightHelper = new THREE.DirectionalLightHelper(light, 4);
    scene.add(lightHelper);
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  }

  createCamera(near = 0.1) {
    const { height, width, canvas, scene } = this;
    const far = width * 10;
    const camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, near, far);
    const cameraLookAtPostion = (this.cameraLookAtPostion = scene.position);
    // 稍后调整相机位置
    camera.position.set(-width * 4, -height * 2, height * 2);
    camera.up.set(0, 0, 1);
    camera.lookAt(cameraLookAtPostion);
    this.camera = camera;

    if (this.cameraHelpers) {
      // 相机helper
      const helper = new THREE.CameraHelper(camera);
      scene.add(helper);
      const controls = new OrbitControls(camera, canvas);
      controls.target.set(0, 0, 0);
      controls.update();
      this.orbitControl = controls;
    }
    this.scene.add(camera);
  }

  moveCamera(isStart, onComplete = () => {}) {
    const { props, camera, cameraLookAtPostion } = this;
    const { x: startPropX, y: startPropY } = props.getCurrentProp().position;
    const { x: endPropX, y: endPropY } = props.getNextProp().position;
    const targetX = Math.floor((endPropX + startPropX) / 2);
    const targetY = Math.floor((endPropY + startPropY) / 2);

    const { x: lookAtPostionX, y: lookAtPostionY } = cameraLookAtPostion;
    const directionVector = { x: Math.floor(targetX - lookAtPostionX), y: Math.floor(targetY - lookAtPostionY) };
    const { x: cameraPositionX, y: cameraPositionY, z } = camera.position;
    const cameraTargetPosition = { x: Math.floor(cameraPositionX + directionVector.x), y: Math.floor(cameraPositionY + directionVector.y), z };
    const animator = new Animation({
      duration: 500,
      iterations: 1,
    });

    if (isStart === 0) {
      camera.position.set(cameraTargetPosition.x, cameraTargetPosition.y, cameraTargetPosition.z);
      camera.lookAt(targetX, targetY, cameraLookAtPostion?.z );
      camera.updateProjectionMatrix();
      this.cameraLookAtPostion = { x: targetX, y: targetY, z: cameraLookAtPostion?.z };
      return;
    }

    animator.animate(
      {
        el: camera,
        start: {
          cameraPosition: { ...camera?.position },
          cameraLookAt: { ...cameraLookAtPostion },
        },
        end: {
          cameraPosition: { ...cameraTargetPosition },
          cameraLookAt: { x: targetX, y: targetY, z: cameraLookAtPostion?.z },
        },
      },
      ({ target: { el, start, end }, timing: { p } }) => {
        camera.position.x = start.cameraPosition.x * (1 - p) + end.cameraPosition.x * p;
        camera.position.y = start.cameraPosition.y * (1 - p) + end.cameraPosition.y * p;

        camera.lookAt.x = start.cameraLookAt.x * (1 - p) + end.cameraLookAt.x * p;
        camera.lookAt.y = start.cameraLookAt.y * (1 - p) + end.cameraLookAt.y * p;
        camera.updateProjectionMatrix();
        this.cameraLookAtPostion = { x: targetX, y: targetY, z: cameraLookAtPostion?.z };
      }
    ).then(res => {
      console.log(res);
      onComplete();
    });
  }

  createPlane() {
    const planeGeometry = new THREE.PlaneBufferGeometry(this.width * 4, this.height * 2, 1, 1);
    const planeMeterial = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(planeGeometry, planeMeterial);
    plane.receiveShadow = true;
    this.plane = plane;
    this.add(plane);
  }

  createWebGlRender() {
    const { canvas } = this;
    const renderer = (this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    }));
    renderer.shadowMap.enabled = true;
  }

  render(mixer, clock) {
    const { camera, scene, renderer, orbitControl } = this;

    this.renderRequested = undefined;

    if (resizeRendererToDisplaySize(this.renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      orbitControl?.update();
    }
    renderer.render(scene, camera);
    if (mixer && clock) {
      mixer.update(clock.getDelta());
    }
  }

  requestRenderIfNotRequested() {
    const { render } = this;
    if (!this.renderRequested) {
      this.renderRequested = true;
      requestAnimationFrame(render.bind(this));
    }
  }

  bindEvent() {
    const { requestRenderIfNotRequested, cameraHelpers, orbitControl } = this;
    if (cameraHelpers) {
      orbitControl.addEventListener('change', requestRenderIfNotRequested.bind(this));
    }
    window.addEventListener('resize', requestRenderIfNotRequested.bind(this));
  }

  add(...args) {
    this.scene.add(...args);
  }

  remove(...args) {
    this.scene.remove(...args);
  }
}

export default Stage;
