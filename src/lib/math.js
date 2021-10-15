import * as THREE from 'three';
export const normalization = (vector = {}) => {
  const { x = 0, y = 0, z = 0 } = vector;
  const len = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
  return { x: x / len, y: y / len, z: z / len };
};

export const getVectorAngle = (startVector, endVector) => {
  const startNormalVector = normalization(startVector);
  const endNormalVector = normalization(endVector);
  const cosAngleVal = vectorDot(startNormalVector, endNormalVector);
  const angleDirection = vectorCross(startNormalVector, endNormalVector);
  let angle;
  if (angleDirection.z < 0) {
    console.log('direction', -1);
    angle = -1 * Math.acos(cosAngleVal)
  } else {
    console.log('direction', 1);
    angle = Math.acos(cosAngleVal)
  }
  return angle;
};

export const vectorDot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;

export const vectorCross = (a, b) => {
  let ax = a.x;
  let ay = a.y;
  let az = a.z;
  let bx = b.x;
  let by = b.y;
  let bz = b.z;

  return { x: ay * bz - az * by, y: az * bx - ax * bz, z: ax * by - ay * bx };
};

export const subtract = (v1, v2) => ({
  x: v1.x - v2.x,
  y: v1.y - v2.y,
  z: v1.z - v2.z,
});
