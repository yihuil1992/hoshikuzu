'use client';
import { useEffect, useRef, useState } from 'react';
import { counterEffects } from '@/constants/sound-effects';

/**
 * 根据秒数与 soundId 播放倒计时音效：
 * - 倒数 <5 且 >0：播放 counterSound
 * - 到 0：播放 finishSound
 * - 自动处理静音（id = -1 或 playSound=false）
 * - 处理浏览器自动播放限制：首次用户手势后“解锁”音频
 */
export function useCountdownSounds(seconds: number, soundId: number) {
  const beepRef = useRef<HTMLAudioElement | null>(null);
  const finishRef = useRef<HTMLAudioElement | null>(null);
  const unlockedRef = useRef(false);

  const [setting, setSetting] = useState(() => {
    const s = counterEffects.find((e) => e.id === soundId) || counterEffects[0];
    return s;
  });

  // 切换音效设置（或 soundId 变化）
  useEffect(() => {
    const s = counterEffects.find((e) => e.id === soundId) || counterEffects[0];
    setSetting(s);

    // 清理旧 audio
    beepRef.current?.pause();
    finishRef.current?.pause();
    beepRef.current = null;
    finishRef.current = null;

    if (s.playSound) {
      const b = new Audio(s.counterSoundPath);
      const f = new Audio(s.finishSoundPath);
      b.preload = 'auto';
      f.preload = 'auto';
      beepRef.current = b;
      finishRef.current = f;
    }
  }, [soundId]);

  // 解锁音频（解决自动播放限制）
  useEffect(() => {
    if (unlockedRef.current) return;

    const unlock = () => {
      unlockedRef.current = true;

      const tryUnlock = (a: HTMLAudioElement | null) => {
        if (!a) return;
        try {
          // 轻触发一次播放再立刻暂停，部分浏览器据此认定为用户触发
          const p = a.play();
          if (p instanceof Promise) {
            p.then(() => a.pause()).catch(() => {});
          } else {
            a.pause();
          }
        } catch {}
      };

      tryUnlock(beepRef.current);
      tryUnlock(finishRef.current);

      // 解锁一次即可
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };

    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  // 根据秒数播放相应音效
  useEffect(() => {
    if (!setting.playSound) return;

    const volume = setting.volume ?? 0.5;
    if (seconds > 0 && seconds < 5) {
      const a = beepRef.current;
      if (a) {
        a.volume = volume;
        a.currentTime = 0;
        a.play().catch(() => {});
      }
    } else if (seconds === 0) {
      const a = finishRef.current;
      if (a) {
        a.volume = volume;
        a.currentTime = 0;
        a.play().catch(() => {});
      }
    }
  }, [seconds, setting.playSound, setting.volume]);
}
