'use client';
import { ReactNode } from 'react';

import { StandaloneFloatingActions, StandaloneThemeProvider } from '@/components/standalone-theme';

export default function StandaloneLayout({ children }: { children: ReactNode }) {
  return (
    <StandaloneThemeProvider>
      <div className="min-h-dvh overflow-hidden bg-background text-foreground">
        <div aria-hidden className="standalone-atmosphere pointer-events-none fixed inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="pb-16">{children}</div>
        </div>
        <StandaloneFloatingActions />
      </div>
    </StandaloneThemeProvider>
  );
}
