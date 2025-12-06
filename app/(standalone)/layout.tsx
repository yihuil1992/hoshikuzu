'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

import BackHomeButton from '@/components/back-home-button';
import { MotionDiv } from '@/components/motion-div';

/**
 * App Router layout for: app/(standalone)/
 * Place your pages under:
 *   app/(standalone)/works/page.tsx
 *   app/(standalone)/meteo-timer/page.tsx
 *   app/(standalone)/terms/page.tsx
 *   app/(standalone)/privacy/page.tsx
 */
export default function StandaloneLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[radial-gradient(1200px_600px_at_50%_-120px,theme(colors.sky.100/.6),transparent),radial-gradient(800px_400px_at_120%_-50px,theme(colors.purple.100/.5),transparent)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <MotionDiv
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-4"
        >
          <BackHomeButton />
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="pb-12"
        >
          {children}
        </MotionDiv>
      </div>
    </div>
  );
}
