'use client';

import { ExternalLink, Globe, Github } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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

function SitePreview({ url, title, imageSrc }: { url: string; title: string; imageSrc: string }) {
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[2px] border border-white/12 bg-[#02040a]">
      <div className="absolute inset-x-0 top-0 flex h-8 items-center gap-2 border-b border-white/10 px-3">
        <span className="h-1.5 w-1.5 rounded-full bg-[#aad7dc]/70" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#f5f0dc]/55" />
        <span className="truncate text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {new URL(url).hostname}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 top-8 overflow-hidden">
        <Image
          src={imageSrc}
          alt={`${title} website screenshot`}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover object-top opacity-85 saturate-[0.86] transition duration-500 group-hover:opacity-100 group-hover:saturate-100"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,4,10,0.08),rgba(2,4,10,0.28))]" />
      </div>
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
    <div className="min-h-dvh">
      <section className="relative px-2 pt-16 pb-8 sm:px-4">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3 text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <span>Selected Work</span>
            <span className="h-px flex-1 bg-white/14" />
            <span>02 records</span>
          </div>
          <h1 className="mt-6 max-w-2xl text-4xl font-light leading-none text-foreground sm:text-5xl">
            Works
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
            A compact archive of production sites, filed as objects in the same observatory as the
            starfield.
          </p>
        </div>
      </section>

      <Separator className="mx-auto max-w-6xl" />

      <section className="px-2 py-10 sm:px-4">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2">
          {items.map((item) => (
            <div key={item.title}>
              <Card className="group overflow-hidden">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between gap-3 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <span>{item.code}</span>
                    <span>{new URL(item.url).hostname}</span>
                  </div>
                  <CardTitle className="flex items-center gap-2 text-base normal-case tracking-normal">
                    <Globe className="size-4 text-[#aad7dc]" /> {item.title}
                  </CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <SitePreview url={item.url} title={item.title} imageSrc={item.imageSrc} />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.tags.map((t) => (
                      <Badge key={t} variant="secondary">
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
            </div>
          ))}
        </div>
      </section>

      <section className="px-2 pb-16 sm:px-4">
        <div className="mx-auto max-w-6xl border border-white/14 bg-card/70 p-5 text-sm leading-6 text-muted-foreground">
          Want a deeper dive (design files, flows, or code)? Reach out and I can share more context.
        </div>
      </section>
    </div>
  );
}
