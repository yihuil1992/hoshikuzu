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
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">今は</span>

      <span
        className={cn(
          'rounded-full px-2 py-0.5 text-sm transition-colors',
          isThirty ? 'bg-primary/10 text-primary' : 'text-muted-foreground',
        )}
      >
        30秒
      </span>

      <Switch
        checked={checked}
        onCheckedChange={() => onToggle()}
        aria-label="switch 30/32 seconds"
        className="data-[state=checked]:bg-primary"
      />

      <span
        className={cn(
          'rounded-full px-2 py-0.5 text-sm transition-colors',
          !isThirty ? 'bg-primary/10 text-primary' : 'text-muted-foreground',
        )}
      >
        32秒
      </span>

      <span className="text-sm text-muted-foreground">から</span>
    </div>
  );
}
