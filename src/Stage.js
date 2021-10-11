import * as THREE from 'three';
import { resizeRendererToDisplaySize } from './lib';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class Stage {
  constructor({ canvas, width, height, cameraHelpers, axesHelpers }) {
    this.canvas = canvas;
    this.height = height;
    this.width = width;
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

  createCamera(near = 0.1, far = 2000) {
    const { height, width, canvas, scene } = this;
    const camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, near, far);
    // 稍后调整相机位置
    camera.position.set(-370, -300, 300);
    camera.lookAt(scene.position);
    camera.up.set(10,10,100);
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

  createPlane() {
    const planeGeometry = new THREE.PlaneBufferGeometry(10e2, 10e2, 1, 1);
    const planeMeterial = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(planeGeometry, planeMeterial);
    // plane.rotation.x = -0.5 * Math.PI;
    // plane.position.y = -0.1;
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
      orbitControl.update();
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
