'use client';
import * as React from 'react';
import { counterEffects } from '@/constants/sound-effects';
import { IconVolume, IconVolumeOff } from '@tabler/icons-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SoundSelect({
  value,
  onChange,
}: {
  value: number;
  onChange: (id: number) => void;
}) {
  return (
    <div className={'mx-auto w-fit'}>
      <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger className="h-9">
          <SelectValue placeholder="Choose sound" />
        </SelectTrigger>
        <SelectContent>
          {counterEffects.map((effect) => (
            <SelectItem key={effect.id} value={String(effect.id)}>
              <span className="inline-flex items-center gap-2">
                {effect.playSound ? <IconVolume size={16} /> : <IconVolumeOff size={16} />}
                <span className="leading-none">{effect.id === -1 ? 'Mute' : effect.id}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
