'use client';

import { useMemo } from 'react';

import CountdownCard from '@/components/timers/countdown-card';
import SecondsSwitch from '@/components/timers/seconds-switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCountdown } from '@/hooks/use-countdown';
import { useCountdownSounds } from '@/hooks/use-countdown-sounds';
import { useLocalStorage } from '@/hooks/use-local-storage';

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
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-2 pt-16 pb-16 sm:px-4">
      <section>
        <div className="flex items-center gap-3 text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          <span>Meteo Timer</span>
          <span className="h-px flex-1 bg-white/14" />
          <span>2 instruments</span>
        </div>
        <h1 className="mt-5 text-4xl font-light leading-none text-foreground sm:text-5xl">
          Meteo Timer
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-[#c7d0dd]">
          Two compact countdown instruments for repeated timing. Controls stay visible and quiet so
          the rhythm is easy to read at a glance.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <CountdownCard
          title="消し炭"
          seconds={k.seconds}
          cycleStart={k.cycleStart}
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
          cycleStart={b.cycleStart}
          isRunning={b.isRunning}
          onMinus={b.dec}
          onPlus={() => b.inc(60)}
          onStartStop={b.toggle}
          onReset={() => b.reset(60)}
          soundId={bSound}
          onSoundChange={setBSound}
        />
      </div>

      <Separator className="my-1" />

      <div className="flex justify-center gap-2">
        <Button
          variant={k.isRunning || b.isRunning ? 'destructive' : 'default'}
          onClick={k.isRunning || b.isRunning ? stopBoth : startBoth}
        >
          {k.isRunning || b.isRunning ? 'Stop Both' : 'Start Both'}
        </Button>
        <Button variant="outline" onClick={resetBoth}>
          Reset Both
        </Button>
      </div>
    </div>
  );
}
