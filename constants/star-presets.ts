import * as THREE from 'three';

export type PresetStar = {
  name: string;
  url: string;
  description: string;
  color: string;
  emissive: string;
  position: THREE.Vector3;
};

export const presetStars: PresetStar[] = [
  {
    name: 'Meteo Timer',
    url: '/meteo-timer',
    description: 'Tools for Flyff Universe players: in-game event timers and more.',
    color: '#9be7ff',
    emissive: '#3db3ff',
    position: new THREE.Vector3(-2, 1.2, 0),
  },
  {
    name: 'Stardust Works',
    url: '/works',
    description: 'A collection of my projects and experiments.',
    color: '#ffb6e9',
    emissive: '#ff69c7',
    position: new THREE.Vector3(2.5, -1.0, 0),
  },
  {
    name: 'Grinding Planner',
    url: '/grinding-planner',
    description: 'Optimize your monster grinding routes and experience gains.',
    color: '#baffc9',
    emissive: '#69ff9e',
    position: new THREE.Vector3(0, 0, 0),
  },
];
