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

export function computeCameraInitalPosition(verticalDeg, horizontalDeg, top, bottom, near, far) {
  const verticalRadian = verticalDeg * (Math.PI / 180);
  const horizontalRadian = horizontalDeg * (Math.PI / 180);
  const minY = Math.cos(verticalRadian) * bottom;
  const maxY = Math.sin(verticalRadian) * (far - near - top / Math.tan(verticalRadian));

  if (minY > maxY) {
    console.warn('警告: 垂直角度太小了!');
  }
  // 取一个中间值靠谱
  const y = minY + (maxY - minY) / 2;
  const longEdge = y / Math.tan(verticalRadian);
  const x = Math.sin(horizontalRadian) * longEdge;
  const z = Math.cos(horizontalRadian) * longEdge;

  return { x, y, z };
}

export function computeRandomFromRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function computeRandomFromArr(arr) {
  if (arr?.length) {
    return arr[Math.floor(Math.random() * arr?.length)] || arr[0] || '';
  }
}

export function animation(
  key,
  {
    prop,
    duration = 2,
    timeScale = 5,
    name = 'Box',
    times = [],
    values = [],
    onUpdate = () => {},
    onComplete = () => {},
  }
) {
  let animationFrameId;
  const clock = new THREE.Clock();
  const propName = `${name}_${prop.uuid}`;
  prop.name = propName;
  const posTrack = new THREE.KeyframeTrack(`${propName}.${key}`, times, values);
  const clip = new THREE.AnimationClip('default', duration, [posTrack]);
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
