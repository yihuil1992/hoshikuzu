'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';

import CountdownRing from './countdown-ring';
import SoundSelect from './sound-select';

type Props = {
  title: string;
  seconds: number;
  /** 当前这轮的起始秒（决定百分比上限） */
  cycleStart: number;
  isRunning: boolean;

  onMinus: () => void;
  onPlus: () => void;
  onStartStop: () => void;
  onReset: () => void;

  soundId: number;
  onSoundChange: (id: number) => void;

  /** 插槽：额外控件（如 30/32 开关） */
  extra?: React.ReactNode;
};

export default function CountdownCard({
  title,
  seconds,
  cycleStart,
  isRunning,
  onMinus,
  onPlus,
  onStartStop,
  onReset,
  soundId,
  onSoundChange,
  extra,
}: Props) {
  const pct = Math.max(0, Math.min(100, (seconds / Math.max(1, cycleStart)) * 100));

  return (
    <div className="mx-auto w-full border border-border bg-card/80 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </h2>
        <div className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {cycleStart}s cycle
        </div>
      </div>

      <div className="mb-3 flex justify-center">
        <SoundSelect value={soundId} onChange={onSoundChange} />
      </div>

      {extra && <div className="mb-2">{extra}</div>}

      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" size="icon" onClick={onMinus} aria-label={`Decrease ${title}`}>
          −
        </Button>

        <CountdownRing
          value={pct}
          label={<div className="text-4xl font-light tabular-nums text-foreground">{seconds}</div>}
        />

        <Button variant="outline" size="icon" onClick={onPlus} aria-label={`Increase ${title}`}>
          +
        </Button>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        <Button
          onClick={onStartStop}
          variant={isRunning ? 'destructive' : 'default'}
        >
          {isRunning ? 'Stop' : 'Start'}
        </Button>
        <Button onClick={onReset} variant="outline">
          Reset
        </Button>
      </div>
    </div>
  );
}
