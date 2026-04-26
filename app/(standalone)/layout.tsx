'use client';
import { ReactNode } from 'react';

import BackHomeButton from '@/components/back-home-button';

export default function StandaloneLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-45 [background-image:radial-gradient(circle_at_18%_22%,rgba(248,250,252,0.32)_0_1px,transparent_1px),radial-gradient(circle_at_74%_18%,rgba(170,215,220,0.22)_0_1px,transparent_1px),radial-gradient(circle_at_42%_76%,rgba(245,240,220,0.24)_0_1px,transparent_1px)] [background-size:280px_240px,360px_300px,440px_380px]"
      />
      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-4">
          <BackHomeButton />
        </div>

        <div className="pb-16">{children}</div>
      </div>
    </div>
  );
}
