'use client';

import * as React from 'react';

import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export default function SecondsSwitch({
  isThirty,
  onToggle,
}: {
  isThirty: boolean;
  onToggle: () => void;
}) {
  const checked = !isThirty; // 右 = 32秒

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <span className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        今は
      </span>

      <span
        className={cn(
          'border px-2 py-0.5 text-xs transition-colors',
          isThirty ? 'border-primary/40 bg-primary/10 text-primary' : 'border-transparent text-muted-foreground',
        )}
      >
        30秒
      </span>

      <Switch
        checked={checked}
        onCheckedChange={() => onToggle()}
        aria-label="switch 30/32 seconds"
      />

      <span
        className={cn(
          'border px-2 py-0.5 text-xs transition-colors',
          !isThirty ? 'border-primary/40 bg-primary/10 text-primary' : 'border-transparent text-muted-foreground',
        )}
      >
        32秒
      </span>

      <span className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        から
      </span>
    </div>
  );
}
