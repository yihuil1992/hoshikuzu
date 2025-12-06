'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Globe, Sparkles, Github } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { MotionDiv } from '@/components/motion-div';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * WorksPage
 * - Tailwind v4 styles + shadcn/ui components
 * - Highlights two projects: shakingcrab.com and digxipop.com
 * - Drop into app/(marketing)/works/page.tsx or similar route
 */
function SitePreview({ url, title }: { url: string; title: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border bg-gradient-to-br from-background to-muted">
      {/* Loading skeleton */}
      {loading && !error && <Skeleton className="absolute inset-0" />}

      {/* Error fallback */}
      {error && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="text-sm font-medium">Preview unavailable</div>
            <div className="text-xs text-muted-foreground">{title}</div>
          </div>
        </div>
      )}

      {/* Actual image */}
    </div>
  );
}

export default function WorksPage() {
  const items: Array<{
    title: string;
    url: string;
    description: string;
    tags: string[];
    repo?: string;
    accent: string;
  }> = [
    {
      title: 'Shaking Crab',
      url: 'https://shakingcrab.com',
      description:
        'Seafood boil restaurant group website with locations, menus, promos, and online-order integrations. Focused on quick navigation and conversion.',
      tags: ['Next.js', 'Tailwind', 'SEO', 'Analytics'],
      accent: 'from-red-500 via-orange-500 to-yellow-400',
    },
    {
      title: 'DigxiPop',
      url: 'https://digxipop.com',
      description:
        'E‑commerce experience for customizable 3D figurines. Rich product detail, configurators, and modern checkout flows.',
      tags: ['Next.js 15', 'shadcn/ui', 'Stripe', '3D / R3F'],
      accent: 'from-sky-500 via-blue-600 to-indigo-500',
    },
  ];

  return (
    <div className="min-h-dvh bg-[radial-gradient(1200px_600px_at_50%_-100px,theme(colors.sky.100/.6),transparent),radial-gradient(800px_400px_at_120%_-50px,theme(colors.pink.100/.6),transparent)]">
      {/* Hero */}
      <section className="relative px-6 sm:px-10 md:px-16 lg:px-20 pt-16 pb-8">
        <MotionDiv
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-6xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground bg-background/60 shadow-sm backdrop-blur">
            <Sparkles className="size-4" />
            Selected work
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Works</h1>
          <p className="mt-3 text-balance text-muted-foreground">
            A tiny gallery of production sites I designed & built.
          </p>
        </MotionDiv>
      </section>

      <Separator className="mx-auto max-w-6xl" />

      {/* Grid */}
      <section className="px-6 sm:px-10 md:px-16 lg:px-20 py-10">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2">
          {items.map((item, i) => (
            <MotionDiv
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
            >
              <Card className="group relative overflow-hidden border-muted/60">
                <div
                  aria-hidden
                  className={`pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r ${item.accent} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30`}
                />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="size-5" /> {item.title}
                  </CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <SitePreview url={item.url} title={item.title} />
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="rounded-md bg-foreground/5 px-3 py-1 text-xs text-foreground/70">
                        Project cover — replace with screenshot
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="rounded-full">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                  <Button asChild size="sm" className="gap-2">
                    <Link href={item.url} target="_blank" rel="noreferrer">
                      Visit site <ExternalLink className="size-4" />
                    </Link>
                  </Button>

                  {item.repo ? (
                    <Button asChild size="sm" variant="outline" className="gap-2">
                      <Link href={item.repo} target="_blank" rel="noreferrer">
                        <Github className="size-4" /> Source
                      </Link>
                    </Button>
                  ) : (
                    <div className="text-xs text-muted-foreground">Private repo</div>
                  )}
                </CardFooter>
              </Card>
            </MotionDiv>
          ))}
        </div>
      </section>

      {/* Footer note */}
      <section className="px-6 sm:px-10 md:px-16 lg:px-20 pb-16">
        <div className="mx-auto max-w-6xl rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
          Want a deeper dive (design files, flows, or code)? Reach out and I can share more context.
        </div>
      </section>

      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-30%);
          }
          100% {
            transform: translateX(30%);
          }
        }
      `}</style>
    </div>
  );
}
