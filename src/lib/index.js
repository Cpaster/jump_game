import * as THREE from 'three';

export const resizeRendererToDisplaySize = renderer => {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
};

export function computeRandomFromRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function computeRandomFromArr(arr) {
  if (arr?.length) {
    return arr[Math.floor(Math.random() * arr?.length)] || arr[0] || '';
  }
}

export function animation(
  prop,
  propArr = [],
  { duration = 2, timeScale = 5, times = [], values = [], onUpdate = () => {}, onComplete = () => {} }
) {
  let animationFrameId;
  const clock = new THREE.Clock();

  const tracks = propArr.map(propItem => {
    const { name, key } = propItem;
    const propName = `${name}_${prop.uuid}`;
    prop.name = propName;
    const posTrack = new THREE.KeyframeTrack(`${propName}.${key}`, times, values);
    return posTrack;
  });
  const clip = new THREE.AnimationClip('default', duration, tracks || []);
  const mixer = new THREE.AnimationMixer(prop);
  const animationAction = mixer.clipAction(clip);
  animationAction.setLoop(THREE.LoopOnce);
  animationAction.clampWhenFinished = true;
  animationAction.timeScale = timeScale;
  animationAction.play();
  function render() {
    animationFrameId = requestAnimationFrame(render);
    onUpdate && onUpdate();
    mixer.update(clock.getDelta());
  }
  mixer.addEventListener('finished', e => {
    cancelAnimationFrame(animationFrameId);
    onComplete && onComplete();
  });
  render();
}
