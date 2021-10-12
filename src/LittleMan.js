import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';

class LittleMan {
  constructor({ world, canvas, stage, height, width, color = 0x386899 }) {
    this.stage = stage;
    this.canvas = canvas;
    this.height = height;
    this.width = width;
    this.world = world;
    this.color = color;
    this.littleManMesh = null;
    this.littleManmaterial = null;
  }
  createLittleMan() {
    const { color } = this;
    this.material = new THREE.MeshStandardMaterial({ color });
    const littleManMesh = (this.littleManMesh = new THREE.Group());
    this.createLittleManHeader();
    this.createLittleManBody();
    littleManMesh.translateZ(-7);
    // littleManMesh.scale.set(1,1,0.5)
    return littleManMesh;
  }

  createLittleManHeader() {
    const { width, material, littleManMesh } = this;
    const headerGeo = new THREE.SphereGeometry(width * 0.04, 50, 50);
    const headerMesh = new THREE.Mesh(headerGeo, material);
    headerMesh.position.set(0, 0, 139);
    headerMesh.castShadow = true;
    littleManMesh.add(headerMesh);
  }

  createLittleManBody() {
    const { width, height, material, littleManMesh, stage } = this;
    const bodyBottomGeo = new THREE.CylinderGeometry(width * 0.03, width * 0.06, Math.floor((width * 3) / 21), 50, 50);
    bodyBottomGeo.translate(0, 0, 0);
    const bodyMidGeo = new THREE.CylinderGeometry(width * 0.04, width * 0.03, Math.floor(width / 21), 50, 50);
    bodyMidGeo.translate(0, 35, 0);
    const bodyTopGeo = new THREE.SphereGeometry(width * 0.04, 50, 50);
    bodyTopGeo.translate(0, 43, 0);
    const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries([bodyTopGeo, bodyMidGeo, bodyBottomGeo], false);
    mergedGeometry.rotateX(Math.PI / 2);
    mergedGeometry.translate(0,0,25);
    const bodyMesh = new THREE.Mesh(mergedGeometry, material);
    console.log(bodyMesh);
    // bodyMesh.scale.z = 0.3
    const box = new THREE.BoxHelper( bodyMesh, 0xffff00 );
    stage.add( box );
    stage.render();
    bodyMesh.castShadow = true;
    bodyMesh.position.set(0,0,50);
    bodyMesh.scale.z = 1;
    littleManMesh.add(bodyMesh);
  }

  enterStage() {
    const { stage } = this;
    const { littleManMesh } = this;
    littleManMesh.position.set(0, 0, 0);
    stage.add(littleManMesh);
    stage.render();
  }
}

export default LittleMan;
