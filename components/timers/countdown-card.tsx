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
    <div className="rounded-xl border bg-card p-4 w-fit mx-auto">
      <h2 className="mb-2 text-xl font-extrabold text-center">{title}</h2>

      <div className="mb-3">
        <SoundSelect value={soundId} onChange={onSoundChange} />
      </div>

      {extra && <div className="mb-2">{extra}</div>}

      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={onMinus} className="rounded-lg">
          −
        </Button>

        <CountdownRing value={pct} label={<div className="text-3xl font-bold">{seconds}</div>} />

        <Button variant="outline" size="icon" onClick={onPlus} className="rounded-lg">
          +
        </Button>
      </div>

      <div className="mt-3 flex gap-2 justify-center">
        <Button
          onClick={onStartStop}
          variant={isRunning ? 'destructive' : 'default'}
          className="font-semibold"
        >
          {isRunning ? 'Stop' : 'Start'}
        </Button>
        <Button onClick={onReset} variant="outline" className="font-semibold">
          Reset
        </Button>
      </div>
    </div>
  );
}
