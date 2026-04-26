'use client';

import { ExternalLink, Globe, Github } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { useStandaloneTheme } from '@/components/standalone-theme';
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
import { cn } from '@/lib/utils';

type WorksMode = 'archive' | 'night';

const worksTheme = {
  archive: {
    page:
      'bg-[#f7f8f3] text-[#172033] [--works-paper:#f7f8f3] [--works-ink:#172033] [--works-muted:#66727f] [--works-faint:#8a94a0] [--works-line:rgba(36,48,64,0.18)] [--works-panel:rgba(255,255,252,0.78)] [--works-photo:rgba(255,255,255,0.72)] [--works-primary:#172033] [--works-primary-text:#f7f8f3] [--works-accent:#477c86]',
    atmosphere:
      'opacity-70 [background-image:linear-gradient(rgba(36,48,64,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(36,48,64,0.045)_1px,transparent_1px),radial-gradient(circle_at_19%_24%,rgba(71,124,134,0.25)_0_1px,transparent_1px),radial-gradient(circle_at_78%_18%,rgba(145,118,71,0.18)_0_1px,transparent_1px),radial-gradient(circle_at_42%_78%,rgba(36,48,64,0.16)_0_1px,transparent_1px)] [background-size:72px_72px,72px_72px,280px_240px,360px_300px,440px_380px]',
  },
  night: {
    page:
      'bg-[#02040a] text-[#f8fafc] [--works-paper:#02040a] [--works-ink:#f8fafc] [--works-muted:#aeb8c7] [--works-faint:#6f7b8d] [--works-line:rgba(255,255,255,0.14)] [--works-panel:rgba(5,7,13,0.8)] [--works-photo:rgba(2,4,10,1)] [--works-primary:#f5f0dc] [--works-primary-text:#02040a] [--works-accent:#aad7dc]',
    atmosphere:
      'opacity-45 [background-image:radial-gradient(circle_at_18%_22%,rgba(248,250,252,0.32)_0_1px,transparent_1px),radial-gradient(circle_at_74%_18%,rgba(170,215,220,0.22)_0_1px,transparent_1px),radial-gradient(circle_at_42%_76%,rgba(245,240,220,0.24)_0_1px,transparent_1px)] [background-size:280px_240px,360px_300px,440px_380px]',
  },
} satisfies Record<WorksMode, { page: string; atmosphere: string }>;

function SitePreview({
  url,
  title,
  imageSrc,
  mode,
}: {
  url: string;
  title: string;
  imageSrc: string;
  mode: WorksMode;
}) {
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[2px] border border-[color:var(--works-line)] bg-[color:var(--works-photo)]">
      <div className="absolute inset-x-0 top-0 flex h-8 items-center gap-2 border-b border-[color:var(--works-line)] px-3">
        <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--works-accent)]/75" />
        <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--works-faint)]/70" />
        <span className="truncate text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--works-muted)]">
          {new URL(url).hostname}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 top-8 overflow-hidden">
        <Image
          src={imageSrc}
          alt={`${title} website screenshot`}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className={cn(
            'object-cover object-top transition-[opacity,filter] duration-300 ease-[var(--ease-out-quint)] group-hover:opacity-100 group-hover:saturate-100',
            mode === 'archive' ? 'opacity-95 saturate-[0.9]' : 'opacity-85 saturate-[0.86]',
          )}
        />
        <div
          className={cn(
            'pointer-events-none absolute inset-0 transition-opacity duration-300 ease-[var(--ease-out-quint)] group-hover:opacity-70',
            mode === 'archive'
              ? 'bg-[linear-gradient(to_bottom,rgba(247,248,243,0.02),rgba(247,248,243,0.22))]'
              : 'bg-[linear-gradient(to_bottom,rgba(2,4,10,0.08),rgba(2,4,10,0.28))]',
          )}
        />
      </div>
    </div>
  );
}

export default function WorksPage() {
  const { mode } = useStandaloneTheme();
  const theme = worksTheme[mode];

  const items: Array<{
    title: string;
    url: string;
    description: string;
    tags: string[];
    repo?: string;
    code: string;
    imageSrc: string;
  }> = [
    {
      title: 'Shaking Crab',
      url: 'https://shakingcrab.com',
      description:
        'Seafood boil restaurant group website with locations, menus, promos, and online-order integrations. Focused on quick navigation and conversion.',
      tags: ['Next.js', 'Tailwind', 'SEO', 'Analytics'],
      code: 'WORK-01',
      imageSrc: '/assets/works/shaking-crab.png',
    },
    {
      title: 'DigxiPop',
      url: 'https://digxipop.com',
      description:
        'E‑commerce experience for customizable 3D figurines. Rich product detail, configurators, and modern checkout flows.',
      tags: ['Next.js 15', 'shadcn/ui', 'Stripe', '3D / R3F'],
      code: 'WORK-02',
      imageSrc: '/assets/works/digxipop.png',
    },
  ];

  return (
    <div className={cn('relative -my-6 ml-[calc(50%-50vw)] min-h-dvh w-screen px-4 py-6 sm:px-6', theme.page)}>
      <div aria-hidden className={cn('pointer-events-none fixed inset-0', theme.atmosphere)} />
      <section className="relative px-2 pt-16 pb-8 sm:px-4">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center gap-3 text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--works-muted)]">
            <span>Selected Work</span>
            <span className="h-px min-w-24 flex-1 bg-[color:var(--works-line)]" />
            <span>02 Records</span>
          </div>
          <h1 className="mt-6 max-w-2xl text-4xl font-light leading-none text-[color:var(--works-ink)] sm:text-5xl">
            Works
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[color:var(--works-muted)]">
            Production sites filed as observatory records: screenshots, notes, and launch paths in
            one quiet catalog.
          </p>
        </div>
      </section>

      <Separator className="mx-auto max-w-6xl bg-[color:var(--works-line)]" />

      <section className="px-2 py-10 sm:px-4">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2">
          {items.map((item) => (
            <div key={item.title}>
              <Card className="group overflow-hidden border-[color:var(--works-line)] bg-[color:var(--works-panel)] text-[color:var(--works-ink)] shadow-none">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between gap-3 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--works-muted)]">
                    <span>{item.code}</span>
                    <span>{new URL(item.url).hostname}</span>
                  </div>
                  <CardTitle className="flex items-center gap-2 text-base normal-case tracking-normal text-[color:var(--works-ink)]">
                    <Globe className="size-4 text-[color:var(--works-accent)]" /> {item.title}
                  </CardTitle>
                  <CardDescription className="text-[color:var(--works-muted)]">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <SitePreview
                      url={item.url}
                      title={item.title}
                      imageSrc={item.imageSrc}
                      mode={mode}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.tags.map((t) => (
                      <Badge
                        key={t}
                        variant="secondary"
                        className="border-[color:var(--works-line)] bg-transparent text-[color:var(--works-muted)]"
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                  <Button
                    asChild
                    size="sm"
                    className="gap-2 border-[color:var(--works-primary)] bg-[color:var(--works-primary)] text-[color:var(--works-primary-text)] hover:bg-[color:var(--works-primary)]/90"
                  >
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
                    <div className="text-xs text-[color:var(--works-muted)]">Private repo</div>
                  )}
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
