
export const counterEffects = [
  {
    id: 1,
    name: 'counter1',
    playSound: true,
    counterSoundPath: '/assets/sounds/LAPUTA_counter_2.mp3',
    finishSoundPath: '/assets/sounds/LAPUTA_counter_3.mp3',
    volume: 1,
  },
  {
    id: 2,
    name: 'counter2',
    playSound: true,
    counterSoundPath: '/assets/sounds/maou_se_system27.mp3',
    finishSoundPath: '/assets/sounds/maou_se_onepoint28.mp3',
    volume: 0.3,
  },
  {
    id: -1,
    name: 'mute',
    playSound: false,
    counterSoundPath: '',
  },
];
