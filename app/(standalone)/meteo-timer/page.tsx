'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { useMemo } from 'react';
import CountdownCard from '@/components/timers/countdown-card';
import SecondsSwitch from '@/components/timers/seconds-switch';
import { useCountdown } from '@/hooks/use-countdown';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useCountdownSounds } from '@/hooks/use-countdown-sounds';

export default function MeteoTimerPage() {
  // 消し炭：30/32 交替
  const nextK = useMemo(() => (prev: number) => (prev === 30 ? 32 : 30), []);
  const k = useCountdown({ initial: 30, nextStart: nextK });
  const [kSound, setKSound] = useLocalStorage<number>('keshizumiSoundId', 1);

  // 範囲技：固定 60
  const b = useCountdown({ initial: 60, nextStart: () => 60 });
  const [bSound, setBSound] = useLocalStorage<number>('blazeSoundId', 2);

  const startBoth = () => {
    k.start();
    b.start();
  };
  const stopBoth = () => {
    k.stop();
    b.stop();
  };
  const resetBoth = () => {
    k.reset(30);
    b.reset(60);
  };

  useCountdownSounds(k.seconds, kSound);
  useCountdownSounds(b.seconds, bSound);

  return (
    <div className="flex flex-col gap-4">
      <CountdownCard
        title="消し炭"
        seconds={k.seconds}
        cycleStart={k.cycleStart} // 30 或 32
        isRunning={k.isRunning}
        onMinus={k.dec}
        onPlus={() => k.inc(32)}
        onStartStop={k.toggle}
        onReset={() => k.reset(30)}
        soundId={kSound}
        onSoundChange={setKSound}
        extra={
          <SecondsSwitch
            isThirty={k.cycleStart === 30}
            onToggle={() => k.setMax(k.cycleStart === 30 ? 32 : 30)}
          />
        }
      />

      <CountdownCard
        title="範囲技"
        seconds={b.seconds}
        cycleStart={b.cycleStart} // 固定 60
        isRunning={b.isRunning}
        onMinus={b.dec}
        onPlus={() => b.inc(60)}
        onStartStop={b.toggle}
        onReset={() => b.reset(60)}
        soundId={bSound}
        onSoundChange={setBSound}
      />

      <Separator className="my-1" />

      <div className="flex justify-center gap-2">
        <Button
          variant={k.isRunning || b.isRunning ? 'destructive' : 'default'}
          onClick={k.isRunning || b.isRunning ? stopBoth : startBoth}
          className="font-semibold"
        >
          {k.isRunning || b.isRunning ? 'Stop Both' : 'Start Both'}
        </Button>
        <Button variant="outline" onClick={resetBoth} className="font-semibold">
          Reset Both
        </Button>
      </div>
    </div>
  );
}
