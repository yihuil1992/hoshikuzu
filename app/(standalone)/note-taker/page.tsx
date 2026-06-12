'use client';

import {
  Archive,
  Bot,
  Database,
  Download,
  FileJson,
  Github,
  HardDrive,
  Mic,
  MonitorSpeaker,
  Search,
  ShieldCheck,
  Sparkles,
  Waves,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { MotionDiv } from '@/components/motion-div';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const REPO_URL = 'https://github.com/yihuil1992/note-taker';
const RELEASES_URL = `${REPO_URL}/releases`;

const signals = [
  { label: 'Microphone', value: 'On', icon: Mic },
  { label: 'Computer audio', value: 'On', icon: MonitorSpeaker },
  { label: 'Local AI', value: 'Ready', icon: Bot },
  { label: 'Storage', value: 'SQLite', icon: Database },
];

const capabilities = [
  {
    icon: Waves,
    title: 'Meeting capture',
    desc: 'Records microphone and system audio on Windows in short persisted chunks.',
    tags: ['Microphone', 'Computer audio', 'Tauri 2'],
  },
  {
    icon: Bot,
    title: 'Local transcription',
    desc: 'Uses a Whisper-compatible sidecar by default, with optional OpenAI speech-to-text when selected.',
    tags: ['whisper.cpp', 'large-v3-turbo', 'OpenAI optional'],
  },
  {
    icon: Sparkles,
    title: 'Codex summaries',
    desc: 'Turns transcript segments into structured summaries, topics, decisions, and action items.',
    tags: ['Codex CLI', 'Transcript segments'],
  },
  {
    icon: FileJson,
    title: 'Exportable records',
    desc: 'Stores meetings locally and exports selected records as Markdown or JSON notes.',
    tags: ['Markdown', 'JSON', 'Local search'],
  },
];

const privacyNotes = [
  'Meeting records stay local-first in SQLite.',
  'Raw audio retention defaults to 7 days.',
  'Local Whisper transcription stays on device.',
  'Cloud transcription is opt-in through provider settings.',
];

function ScreenshotFrame({
  src,
  alt,
  label,
}: {
  src: string;
  alt: string;
  label: string;
}) {
  return (
    <div className="overflow-hidden border border-border bg-card">
      <div className="flex h-10 items-center justify-between border-b border-border px-4">
        <div className="inline-flex items-center gap-2 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <Archive className="size-4 text-accent" />
          {label}
        </div>
        <span className="hidden text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:inline">
          Note Taker
        </span>
      </div>
      <div className="relative aspect-[16/9] bg-background">
        <Image
          src={src}
          alt={alt}
          fill
          priority={src.endsWith('note-taker-night.png')}
          sizes="(min-width: 1024px) 54vw, 100vw"
          className="object-cover object-top"
        />
      </div>
    </div>
  );
}

export default function NoteTakerPage() {
  return (
    <div className="min-h-dvh">
      <section className="px-2 pt-16 pb-12 sm:px-4 lg:pt-20">
        <div className="mx-auto grid max-w-6xl gap-9 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-center">
          <div>
            <div className="flex flex-col items-start gap-2 text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:flex-row sm:items-center sm:gap-3">
              <span>Note Taker</span>
              <span className="hidden h-px min-w-10 flex-1 bg-border sm:block" />
              <span>Local meeting memory</span>
            </div>

            <h1 className="mt-7 max-w-[18rem] text-3xl font-light leading-tight text-foreground sm:max-w-xl sm:text-5xl sm:leading-none">
              A local meeting recorder for the edge of the call.
            </h1>
            <p className="mt-5 max-w-[19rem] text-sm leading-6 text-muted-foreground sm:max-w-xl">
              Note Taker sits beside a meeting, captures microphone and computer audio on Windows,
              transcribes with local Whisper by default, then asks Codex CLI for structured notes.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
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

            <div className="mt-8 grid max-w-xl grid-cols-2 border border-border bg-card/55">
              {signals.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="min-w-0 border-r border-border p-4 even:border-r-0 sm:even:border-r sm:last:border-r-0">
                    <Icon className="mb-5 size-4 text-accent" />
                    <div className="text-2xl font-light leading-none text-foreground">{item.value}</div>
                    <div className="mt-2 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <ScreenshotFrame
            src="/assets/works/note-taker-night.png"
            alt="Note Taker Night Atlas meeting capture console"
            label="Night Atlas console"
          />
        </div>
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
              src="/assets/works/note-taker-archive.png"
              alt="Note Taker Archive Sheet meeting index and capture controls"
              label="Archive Sheet"
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
              <ShieldCheck className="size-4 text-accent" />
              Local-first capture
            </div>
            <h2 className="mt-4 text-2xl font-normal leading-tight text-foreground sm:text-3xl">
              Built for meetings that should stay on the machine.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              The app makes source readiness, provider state, storage path, transcript segments,
              summary state, and export actions visible without turning the meeting record into a
              cloud dashboard.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['Local SQLite', 'Whisper sidecar', 'Codex summary', 'Markdown export'].map((tag) => (
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
            <HardDrive className="size-4 text-accent" />
            Desktop instrument
            <span className="h-px min-w-16 flex-1 bg-border" />
            <Search className="size-4 text-accent" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {capabilities.map((capability) => {
              const Icon = capability.icon;
              return (
                <div key={capability.title} className="border border-border bg-card/70 p-5">
                  <Icon className="mb-4 size-5 text-accent" />
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
              );
            })}
          </div>

          <div className="mt-4 grid gap-1 border border-border bg-border md:grid-cols-4">
            {privacyNotes.map((note) => (
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
