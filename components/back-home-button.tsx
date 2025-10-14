'use client';

import { Home } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { Button } from '@/components/ui/button';

/**
 * Floating BackHomeButton (high-contrast)
 * - Save as: components/back-home-button.tsx
 * - Always-visible text, proper contrast on light/dark backgrounds.
 */
export default function BackHomeButton({ label = 'Home' }: { label?: string }) {
  return (
    <div
      className="fixed z-[60]
                 bottom-[max(16px,env(safe-area-inset-bottom))]
                 right-[max(16px,env(safe-area-inset-right))]
                 md:bottom-6 md:right-6"
    >
      <Button
        asChild
        // Use outline so text color defaults to foreground
        variant="outline"
        size="lg"
        className="rounded-full px-4 md:px-5 border-border bg-background shadow-lg shadow-black/10
                   hover:shadow-xl transition-all
                   backdrop-blur supports-[backdrop-filter]:bg-background/90"
      >
        {/* Force text to foreground to avoid being too light */}
        <Link href="/" className="inline-flex items-center gap-2 text-foreground">
          <Home className="size-4 md:size-5" />
          {/* Always show label (remove hidden on small screens) */}
          <span>{label}</span>
        </Link>
      </Button>
    </div>
  );
}
