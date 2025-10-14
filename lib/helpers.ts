import * as THREE from 'three';

export function getRandomPosition(radius = 4) {
  const theta = Math.random() * 2 * Math.PI;
  const phi = Math.acos(2 * Math.random() - 1);
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi),
  );
}

export function generateStarName() {
  const syllables = ['ka', 'lu', 'ra', 'zo', 'me', 'shi', 'to', 'na', 've', 'xi'];
  const name = Array.from(
    { length: 3 },
    () => syllables[Math.floor(Math.random() * syllables.length)],
  ).join('');
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export const computeSafeRadius = (
  fovDeg: number,
  aspect: number,
  depthFromCamera: number, // 相机到该平面的距离
  margin = 0.82, // 边距比例，留一点屏幕边缘空白
) => {
  const halfV = Math.tan(THREE.MathUtils.degToRad(fovDeg / 2)) * depthFromCamera;
  const halfH = halfV * aspect;
  return margin * Math.min(halfH, halfV);
};

const randOnDisk = (rMin: number, rMax: number) => {
  // sqrt 让面积分布更均匀
  const t = Math.random();
  const r = THREE.MathUtils.lerp(rMin, rMax, Math.sqrt(t));
  const theta = Math.random() * Math.PI * 2;
  return new THREE.Vector3(r * Math.cos(theta), r * Math.sin(theta), 0);
};

// ★ 带最小间距的随机撒点（圆盘内）
export const samplePositionsOnDisk = (
  count: number,
  rMin: number,
  rMax: number,
  minDist: number,
  maxTriesPerPoint = 500,
) => {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    let ok = false;
    let tries = 0;
    // 若尝试太多，还不成功就逐步放宽最小距离（避免死循环）
    let relax = 1.0;
    while (!ok && tries < maxTriesPerPoint) {
      const p = randOnDisk(rMin, rMax);
      ok = pts.every((q) => p.distanceTo(q) >= minDist * relax);
      if (ok) {
        pts.push(p);
      } else {
        tries++;
        if (tries % 120 === 0) relax *= 0.95; // 每 120 次放宽 5%
      }
    }
    if (!ok) {
      // 兜底：强行放一个点（极小概率触发）
      pts.push(randOnDisk(rMin, rMax));
    }
  }
  return pts;
};
