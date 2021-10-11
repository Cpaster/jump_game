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
