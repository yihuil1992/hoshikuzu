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
    description: 'The full archive of production sites, tools, repositories, and experiments.',
    color: '#ffb6e9',
    emissive: '#ff69c7',
    position: new THREE.Vector3(2.5, -1.0, 0),
  },
  {
    name: 'Review Pilot',
    url: '/review-pilot',
    description: 'Mobile-first review operations with Hoshikuzu atlas themes and safe reply flows.',
    color: '#b8d8ff',
    emissive: '#6ea8ff',
    position: new THREE.Vector3(1.6, 0.9, 0),
  },
  {
    name: 'Key Trigger Countdown',
    url: '/key-trigger-countdown',
    description: 'A compact Windows countdown tool that restarts from a global keyboard trigger.',
    color: '#ffe08a',
    emissive: '#ffbd4a',
    position: new THREE.Vector3(-2.4, -1.1, 0),
  },
  {
    name: 'Note Taker',
    url: '/note-taker',
    description: 'A local-first Windows meeting recorder with mini mode, Whisper, Codex summaries, and signed updates.',
    color: '#c7f4df',
    emissive: '#7bd7ad',
    position: new THREE.Vector3(2.2, 1.2, 0),
  },
  {
    name: 'Grinding Planner',
    url: '/grinding-planner',
    description: 'Optimize your monster grinding routes and experience gains.',
    color: '#baffc9',
    emissive: '#69ff9e',
    position: new THREE.Vector3(0, 0, 0),
  },
  {
    name: 'Discord Bot',
    url: '/discord-bot',
    description: 'Flyff Universe guild monitoring with member lookup and pronunciation links.',
    color: '#ffdfba',
    emissive: '#ffb347',
    position: new THREE.Vector3(-1.5, -0.5, 0),
  },
];
