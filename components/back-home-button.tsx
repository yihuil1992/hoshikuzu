'use client';

import { Home } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { Button } from '@/components/ui/button';

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
        variant="outline"
        size="sm"
        className="border-white/18 bg-background/80 px-3 shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur supports-[backdrop-filter]:bg-background/72"
      >
        <Link href="/" className="inline-flex items-center gap-2 text-foreground">
          <Home className="size-4" />
          <span>{label}</span>
        </Link>
      </Button>
    </div>
  );
}
