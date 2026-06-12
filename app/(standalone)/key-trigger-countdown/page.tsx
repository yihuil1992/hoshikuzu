'use client';

import {
  BellRing,
  Clock3,
  Download,
  ExternalLink,
  Github,
  Keyboard,
  MonitorCog,
  Moon,
  MousePointerClick,
  RotateCcw,
  TimerReset,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { MotionDiv } from '@/components/motion-div';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const REPO_URL = 'https://github.com/yihuil1992/key-trigger-countdown';
const RELEASES_URL = `${REPO_URL}/releases`;

const controls = [
  { label: 'Trigger', value: 'F1' },
  { label: 'Seconds', value: '9' },
  { label: 'Signal', value: '2' },
  { label: 'State', value: 'Counting' },
];

const capabilities = [
  {
    icon: Keyboard,
    title: 'Listen outside the app',
    desc: 'The selected key is observed globally while another Windows window stays focused.',
    tags: ['F1-F12', 'D0-D9'],
  },
  {
    icon: RotateCcw,
    title: 'Restart without aiming',
    desc: 'Press the trigger key while the timer is running and the countdown starts over.',
    tags: ['Reset loop', 'No focus swap'],
  },
  {
    icon: BellRing,
    title: 'Signal the final seconds',
    desc: 'A tick sound plays when the remaining time reaches the configured signal threshold.',
    tags: ['Tick sound', 'Threshold'],
  },
  {
    icon: Moon,
    title: 'Two reading modes',
    desc: 'Archive Sheet for a light desk setup, Night Atlas for dimmer sessions.',
    tags: ['Archive', 'Night'],
  },
];

const useCases = [
  'Practice loops with a repeated recovery window.',
  'Game mechanics where focus must stay inside the game.',
  'Stream cues or desk workflows that need a quiet timer.',
];

function CountdownInstrument() {
  return (
    <div className="relative border border-border bg-card p-4 shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
      <div className="mb-4 flex items-center justify-between text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <span>Desktop instrument</span>
        <span>Windows hook</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.68fr)_minmax(0,0.32fr)]">
        <div className="relative aspect-[4/3] overflow-hidden border border-border bg-background">
          <Image
            src="/assets/works/key-trigger-countdown.png"
            alt="Key Trigger Countdown interface screenshot"
            fill
            priority
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-contain p-4"
          />
        </div>
        <div className="grid gap-3">
          {controls.map((control) => (
            <div key={control.label} className="border border-border bg-background/60 p-3">
              <div className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {control.label}
              </div>
              <div className="mt-2 text-2xl font-light text-foreground">{control.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        <span className="h-px bg-border" />
        <span className="inline-flex items-center gap-2">
          <MousePointerClick className="size-4 text-accent" />
          Press F1 to restart
        </span>
        <span className="h-px bg-border" />
      </div>
    </div>
  );
}

export default function KeyTriggerCountdownPage() {
  return (
    <div className="min-h-dvh">
      <section className="px-2 pt-16 pb-14 sm:px-4 lg:pt-20">
        <MotionDiv
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-6xl"
        >
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 border border-border bg-card/45 px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <TimerReset className="size-4 text-accent" />
              Windows desktop tool
            </div>
            <h1 className="mt-6 text-4xl font-light leading-none text-foreground sm:text-5xl">
              A countdown you can reset without touching the window.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-muted-foreground">
              Key Trigger Countdown is a compact Tauri app for repeated timing loops. Start it once,
              keep another app focused, and use a global key to restart the running timer.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild className="gap-2">
                <Link href={RELEASES_URL} target="_blank" rel="noreferrer">
                  View releases <Download className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link href={REPO_URL} target="_blank" rel="noreferrer">
                  <Github className="size-4" /> View source
                </Link>
              </Button>
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-5xl">
            <CountdownInstrument />
          </div>
        </MotionDiv>
      </section>

      <Separator className="mx-auto max-w-6xl" />

      <section className="px-2 py-12 sm:px-4">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)] lg:items-start">
          <div className="grid gap-4 sm:grid-cols-2">
            {capabilities.map((capability, index) => {
              const Icon = capability.icon;
              return (
                <MotionDiv
                  key={capability.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.45, delay: index * 0.04 }}
                >
                  <Card className="atlas-motion-card h-full shadow-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 normal-case tracking-normal">
                        <span className="grid size-9 place-items-center border border-border bg-background">
                          <Icon className="size-5" />
                        </span>
                        {capability.title}
                      </CardTitle>
                      <CardDescription>{capability.desc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {capability.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </MotionDiv>
              );
            })}
          </div>

          <MotionDiv
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.45 }}
            className="border border-border bg-card/70 p-5"
          >
            <div className="inline-flex items-center gap-2 border border-border px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <MonitorCog className="size-4 text-accent" />
              Narrow by design
            </div>
            <h2 className="mt-4 text-2xl font-normal sm:text-3xl">It does one job.</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              The useful part is not another timer screen. It is the background restart behavior:
              a low-level Windows keyboard hook observes supported keys and sends the event to the
              Tauri frontend without consuming the key.
            </p>
          </MotionDiv>
        </div>
      </section>

      <section className="px-2 pb-16 sm:px-4">
        <div className="mx-auto max-w-6xl border border-border bg-card/70 p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center gap-3 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Clock3 className="size-4 text-accent" />
            Repeated timing loops
            <span className="h-px min-w-16 flex-1 bg-border" />
            <Keyboard className="size-4 text-accent" />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {useCases.map((item) => (
              <div key={item} className="border border-border bg-background/45 p-4 text-sm leading-6 text-muted-foreground">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-4 border border-border bg-background/45 p-4 text-sm leading-6 text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>
              Current platform note: the app targets Windows because the trigger is implemented
              with a Windows low-level keyboard hook.
            </span>
            <Button asChild size="sm" variant="outline" className="gap-2">
              <Link href={REPO_URL} target="_blank" rel="noreferrer">
                Project README <ExternalLink className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
