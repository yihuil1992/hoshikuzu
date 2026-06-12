'use client';

import {
  Bell,
  Bot,
  CheckCircle2,
  ExternalLink,
  Github,
  MessageSquareText,
  Moon,
  Send,
  ShieldAlert,
  Smartphone,
  SunMedium,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { MotionDiv } from '@/components/motion-div';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const DEMO_URL = 'https://yihuil1992.github.io/review-pilot';
const REPO_URL = 'https://github.com/yihuil1992/review-pilot';

const stats = [
  { label: 'Unhandled reviews', value: '04', icon: MessageSquareText },
  { label: 'Due tasks', value: '01', icon: Bell },
  { label: 'High risk', value: '01', icon: ShieldAlert },
  { label: 'Drafts ready', value: '02', icon: Bot },
];

const capabilities = [
  {
    title: 'Unified Google review queue',
    desc: 'Reviews from connected locations land in one queue, with optional filtering when a location matters.',
    tags: ['Google Business Profile', 'Location filter'],
  },
  {
    title: 'Codex draft workflow',
    desc: 'Reply generation and revision stay draft-first, so the owner can inspect tone and risk before sending.',
    tags: ['AI draft', 'Revise draft'],
  },
  {
    title: 'Explicit test publish mode',
    desc: 'Demo and test paths make it visible when a publish action records intent without updating Google.',
    tags: ['Safe publish', 'Handled state'],
  },
  {
    title: 'Operational task queue',
    desc: 'Twilio notification work, retries, cancellations, sync status, and follow-up links live beside review work.',
    tags: ['Twilio', 'Tasks', 'Sync status'],
  },
];

const shellNotes = [
  'Night and archive themes share Hoshikuzu tokens.',
  'Desktop uses a left atlas rail and compact command strip.',
  'Mobile keeps top identity, theme control, and bottom navigation in reach.',
];

function ScreenshotFrame({
  src,
  alt,
  label,
  mode,
}: {
  src: string;
  alt: string;
  label: string;
  mode: 'night' | 'archive';
}) {
  return (
    <div className="overflow-hidden border border-border bg-card">
      <div className="flex h-10 items-center justify-between border-b border-border px-4">
        <div className="inline-flex items-center gap-2 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {mode === 'night' ? <Moon className="size-4 text-accent" /> : <SunMedium className="size-4 text-accent" />}
          {label}
        </div>
        <span className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {mode}
        </span>
      </div>
      <div className="relative aspect-[16/9] bg-background">
        <Image
          src={src}
          alt={alt}
          fill
          priority={src.endsWith('review-pilot.png')}
          sizes="(min-width: 1024px) 54vw, 100vw"
          className="object-cover object-top"
        />
      </div>
    </div>
  );
}

export default function ReviewPilotPage() {
  return (
    <div className="min-h-dvh">
      <section className="px-2 pt-16 pb-12 sm:px-4 lg:pt-20">
        <MotionDiv
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto grid max-w-6xl gap-9 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-center"
        >
          <div>
            <div className="flex flex-wrap items-center gap-3 text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              <span>Review Pilot</span>
              <span className="h-px min-w-16 flex-1 bg-border" />
              <span>Hoshikuzu atlas UI</span>
            </div>

            <h1 className="mt-7 max-w-xl text-4xl font-light leading-none text-foreground sm:text-5xl">
              Review operations, filed into the same atlas.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground">
              The app now uses the Hoshikuzu night and archive language: hairline panels, compact
              command surfaces, mobile-first navigation, and a queue built for owner review work.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="gap-2">
                <Link href={DEMO_URL} target="_blank" rel="noreferrer">
                  Open demo <ExternalLink className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link href={REPO_URL} target="_blank" rel="noreferrer">
                  <Github className="size-4" /> View source
                </Link>
              </Button>
            </div>

            <div className="mt-8 grid max-w-xl grid-cols-2 border border-border bg-card/55 sm:grid-cols-4">
              {stats.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="min-w-0 border-r border-border p-4 last:border-r-0">
                    <Icon className="mb-5 size-4 text-accent" />
                    <div className="text-3xl font-light leading-none text-foreground">{item.value}</div>
                    <div className="mt-2 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <ScreenshotFrame
            src="/assets/works/review-pilot.png"
            alt="Review Pilot night mode command center"
            label="Command center"
            mode="night"
          />
        </MotionDiv>
      </section>

      <Separator className="mx-auto max-w-6xl" />

      <section className="px-2 py-12 sm:px-4">
        <div className="mx-auto grid max-w-6xl gap-7 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-start">
          <MotionDiv
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45 }}
          >
            <ScreenshotFrame
              src="/assets/works/review-pilot-queue.png"
              alt="Review Pilot archive mode review queue"
              label="Review operations"
              mode="archive"
            />
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45 }}
            className="border border-border bg-card/70 p-5 sm:p-6"
          >
            <div className="inline-flex items-center gap-2 border border-border px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <Smartphone className="size-4 text-accent" />
              Mobile-first owner flow
            </div>
            <h2 className="mt-4 text-2xl font-normal leading-tight text-foreground sm:text-3xl">
              Open the queue, handle one review, move on.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              The review detail view keeps rating, location, age, Google link, review text, risk
              notes, draft state, and publish actions in one decision path. Public-facing actions
              stay explicit, especially in test mode.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['Unified queue', 'Risk assessment', 'AI draft', 'Test publish'].map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </MotionDiv>
        </div>
      </section>

      <section className="px-2 pb-16 sm:px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5 flex flex-wrap items-center gap-3 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <CheckCircle2 className="size-4 text-accent" />
            Operational surface
            <span className="h-px min-w-16 flex-1 bg-border" />
            <Send className="size-4 text-accent" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {capabilities.map((capability) => (
              <div key={capability.title} className="border border-border bg-card/70 p-5">
                <h3 className="text-base font-medium leading-6 text-foreground">{capability.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{capability.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {capability.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-1 border border-border bg-border md:grid-cols-3">
            {shellNotes.map((note) => (
              <div key={note} className="bg-background/80 p-4 text-sm leading-6 text-muted-foreground">
                {note}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
