// Adapted from tsl-textures/src/planet.js. Kept local to avoid the package
// entrypoint's browser-global side effect during Next.js prerendering.

import { Color } from 'three';
import {
  exp,
  float,
  Fn,
  If,
  Loop,
  mix,
  mul,
  positionGeometry,
  remap,
  smoothstep,
  vec3,
  mx_noise_float as noise,
} from 'three/tsl';

const defaults = {
  position: positionGeometry,
  scale: 2,
  iterations: 5,
  levelSea: 0.3,
  levelMountain: 0.7,
  balanceWater: 0.3,
  balanceSand: 0.2,
  balanceSnow: 0.8,
  colorDeep: new Color(0x123a59).convertLinearToSRGB(),
  colorShallow: new Color(0x87ceeb).convertLinearToSRGB(),
  colorBeach: new Color(0xfffacd).convertLinearToSRGB(),
  colorGrass: new Color(0x3cb371).convertLinearToSRGB(),
  colorForest: new Color(0x003000).convertLinearToSRGB(),
  colorSnow: new Color(0xf0ffff).convertLinearToSRGB(),
  seed: 0,
};

const planetRaw = Fn(
  ([
    position,
    scale,
    iterations,
    levelSea,
    levelMountain,
    balanceWater,
    balanceSand,
    balanceSnow,
    colorDeep,
    colorShallow,
    colorBeach,
    colorGrass,
    colorForest,
    colorSnow,
    seed,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ]: any[]) => {
    const k = float(0).toVar();
    const sum = float(0).toVar();
    const xscale = exp(scale.sub(2)).toVar();
    const xpower = float(2).toVar();

    Loop(iterations.add(10), () => {
      k.addAssign(mul(xpower, noise(position.mul(xscale).add(seed))));
      sum.addAssign(xpower);
      xscale.mulAssign(1.5);
      xpower.mulAssign(0.8);
    });

    k.assign(mul(k, k, 0.5).div(sum));

    const seaThreshold = levelSea.pow(2).toVar();
    const mountainThreshold = levelMountain.pow(2).toVar();
    const sandThreshold = mix(seaThreshold, mountainThreshold, balanceSand).toVar();
    const coastThreshold = mix(seaThreshold, sandThreshold, 0.4).toVar();
    const grassThreshold = mix(seaThreshold, sandThreshold, 0.6).toVar();
    const color = vec3().toVar();

    If(k.lessThan(seaThreshold), () => {
      color.assign(
        mix(
          colorDeep,
          colorShallow,
          remap(k, 0, seaThreshold, 0, 1).pow(exp(balanceWater.mul(-8).add(4))),
        ),
      );
    })
      .ElseIf(k.lessThan(coastThreshold), () => {
        color.assign(mix(colorShallow, colorBeach, remap(k, seaThreshold, coastThreshold)));
      })
      .ElseIf(k.lessThan(grassThreshold), () => {
        color.assign(colorBeach);
      })
      .ElseIf(k.lessThan(sandThreshold), () => {
        color.assign(mix(colorBeach, colorGrass, remap(k, grassThreshold, sandThreshold)));
      })
      .ElseIf(k.lessThan(mountainThreshold), () => {
        color.assign(
          mix(colorGrass, colorForest, remap(k, sandThreshold, mountainThreshold).pow(0.75)),
        );
      })
      .Else(() => {
        const snowThreshold = mix(1, mountainThreshold, balanceSnow);
        color.assign(
          mix(
            colorForest,
            colorSnow,
            smoothstep(
              mix(snowThreshold, mountainThreshold, balanceSnow.pow(0.5)),
              snowThreshold,
              k,
            ),
          ),
        );
      });

    return color;
  },
).setLayout({
  name: 'planetRaw',
  type: 'vec3',
  inputs: [
    { name: 'position', type: 'vec3' },
    { name: 'scale', type: 'float' },
    { name: 'iterations', type: 'int' },
    { name: 'levelSea', type: 'float' },
    { name: 'levelMountain', type: 'float' },
    { name: 'balanceWater', type: 'float' },
    { name: 'balanceSand', type: 'float' },
    { name: 'balanceSnow', type: 'float' },
    { name: 'colorDeep', type: 'vec3' },
    { name: 'colorShallow', type: 'vec3' },
    { name: 'colorBeach', type: 'vec3' },
    { name: 'colorGrass', type: 'vec3' },
    { name: 'colorForest', type: 'vec3' },
    { name: 'colorSnow', type: 'vec3' },
    { name: 'seed', type: 'float' },
  ],
});

export function planet(params: Record<string, unknown> = {}) {
  const {
    position,
    scale,
    iterations,
    levelSea,
    levelMountain,
    balanceWater,
    balanceSand,
    balanceSnow,
    colorDeep,
    colorShallow,
    colorBeach,
    colorGrass,
    colorForest,
    colorSnow,
    seed,
  } = { ...defaults, ...params };

  return planetRaw(
    position,
    scale,
    iterations,
    levelSea,
    levelMountain,
    balanceWater,
    balanceSand,
    balanceSnow,
    colorDeep,
    colorShallow,
    colorBeach,
    colorGrass,
    colorForest,
    colorSnow,
    seed,
  );
}
