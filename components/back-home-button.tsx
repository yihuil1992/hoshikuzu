'use client';

import { Home } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { Button } from '@/components/ui/button';

export default function BackHomeButton({ label = 'Home' }: { label?: string }) {
  return (
    <div
      className="standalone-home-action fixed z-[60]
                 bottom-[max(16px,env(safe-area-inset-bottom))]
                 right-[max(16px,env(safe-area-inset-right))]
                 md:bottom-6 md:right-6"
    >
      <Button
        asChild
        variant="outline"
        size="icon-sm"
        className="home-floating-action group/floating h-8 w-8 justify-start overflow-hidden border-border bg-background/80 px-2 shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur transition-[width,border-color,background-color] duration-200 ease-out hover:w-[5.6rem] focus-visible:w-[5.6rem] supports-[backdrop-filter]:bg-background/72"
      >
        <Link href="/" className="inline-flex min-w-0 items-center gap-2 text-foreground">
          <Home className="size-4 shrink-0" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-[max-width,opacity] duration-200 ease-out group-hover/floating:max-w-16 group-hover/floating:opacity-100 group-focus-visible/floating:max-w-16 group-focus-visible/floating:opacity-100">
            {label}
          </span>
        </Link>
      </Button>
    </div>
  );
}
