declare module 'three/webgpu' {
  import * as THREE from 'three';

  export * from 'three';

  export class WebGPURenderer extends THREE.WebGLRenderer {
    constructor(parameters?: THREE.WebGLRendererParameters);
    init(): Promise<void>;
  }

}

declare module 'three/src/materials/nodes/MeshStandardNodeMaterial.js' {
  import * as THREE from 'three';

  export default class MeshStandardNodeMaterial extends THREE.MeshStandardMaterial {
    colorNode: unknown;
    roughnessNode?: unknown;
    metalnessNode?: unknown;
  }
}

declare module 'three/tsl' {
  export const exp: any;
  export const float: any;
  export const Fn: any;
  export const If: any;
  export const Loop: any;
  export const mix: any;
  export const mul: any;
  export const positionGeometry: any;
  export const remap: any;
  export const smoothstep: any;
  export const vec3: any;
  export const mx_noise_float: any;
}
