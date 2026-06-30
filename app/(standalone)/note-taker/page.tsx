'use client';

import {
  Archive,
  Bot,
  Download,
  FileJson,
  FolderSearch,
  Github,
  HardDrive,
  Mic,
  Minimize2,
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
const RELEASES_URL = `${REPO_URL}/releases/latest`;

const signals = [
  { label: 'Microphone', value: 'On', icon: Mic },
  { label: 'Computer audio', value: 'On', icon: MonitorSpeaker },
  { label: 'Mini mode', value: 'Ready', icon: Minimize2 },
  { label: 'Updater', value: 'Signed', icon: Download },
];

const capabilities = [
  {
    icon: Waves,
    title: 'Meeting capture',
    desc: 'Records microphone and system audio on Windows as separate streams, then keeps source labels attached to the stored chunks.',
    tags: ['Microphone', 'WASAPI loopback', 'Smart chunks'],
  },
  {
    icon: Minimize2,
    title: 'Mini recorder window',
    desc: 'Offers a compact always-on-top recorder for meetings where the full archive console should stay out of the way.',
    tags: ['Mini mode', 'Always on top'],
  },
  {
    icon: Bot,
    title: 'Provider-aware transcription',
    desc: 'Runs local whisper.cpp by default, with optional OpenAI speech-to-text and local fallback when a cloud window fails.',
    tags: ['large-v3-turbo', 'gpt-4o-transcribe', 'Fallback path'],
  },
  {
    icon: ShieldCheck,
    title: 'Glossary and Chinese handling',
    desc: 'Injects team vocabulary into Whisper prompts and normalizes Traditional Chinese transcript output to Simplified Chinese.',
    tags: ['Custom glossary', 'OpenCC'],
  },
  {
    icon: Sparkles,
    title: 'Codex summaries',
    desc: 'Turns transcript segments into structured meeting records with overview, topics, decisions, action items, open questions, and detail.',
    tags: ['Codex CLI', 'Structured record'],
  },
  {
    icon: FolderSearch,
    title: 'Project-aware context',
    desc: 'Registers local project folders as read-only context so Codex can pull relevant snippets while filtering secrets, bulky files, logs, and build output.',
    tags: ['Read-only folders', 'Filtered context'],
  },
  {
    icon: FileJson,
    title: 'Exports and updates',
    desc: 'Exports selected records as Markdown or JSON, then checks GitHub Releases for signed in-app updater bundles.',
    tags: ['Markdown', 'JSON', 'Tauri updater'],
  },
];

const privacyNotes = [
  'Meeting records stay local-first in SQLite.',
  'Raw audio retention defaults to 7 days.',
  'Local Whisper transcription stays on device.',
  'OpenAI transcription is opt-in and uses the OS credential store.',
];

const workflowNotes = [
  'Mini recorder gives the capture path a compact always-on-top surface.',
  'Smart transcription windows skip silence and add short pre/post-roll.',
  'Project folders can be registered as read-only context for Codex summaries.',
  'Signed updater checks GitHub Releases for the latest available bundle.',
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
          className="object-contain object-top sm:object-cover"
        />
      </div>
    </div>
  );
}

function MobileScreenshotFrame() {
  return (
    <div className="mx-auto w-full max-w-[24rem] overflow-hidden border border-border bg-card">
      <div className="flex h-10 items-center justify-between border-b border-border px-4">
        <div className="inline-flex items-center gap-2 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <Archive className="size-4 text-accent" />
          Mobile archive
        </div>
        <span className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          narrow
        </span>
      </div>
      <div className="relative aspect-[390/844] bg-background">
        <Image
          src="/assets/works/note-taker-mobile.png"
          alt="Note Taker mobile Archive Sheet layout"
          fill
          sizes="(min-width: 1024px) 24rem, 100vw"
          className="object-cover object-top"
        />
      </div>
    </div>
  );
}

function MiniRecorderFrame() {
  return (
    <div className="overflow-hidden border border-border bg-card">
      <div className="flex h-10 items-center justify-between border-b border-border px-4">
        <div className="inline-flex items-center gap-2 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <Minimize2 className="size-4 text-accent" />
          Mini recorder
        </div>
        <span className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          compact
        </span>
      </div>
      <div className="relative aspect-[468/290] bg-background">
        <Image
          src="/assets/works/note-taker-mini.png"
          alt="Note Taker mini recorder window"
          fill
          sizes="(min-width: 1024px) 26rem, 100vw"
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
              opens a compact mini recorder when the full console is too much, then asks Codex CLI
              for structured notes after transcription.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="gap-2">
                <Link href={RELEASES_URL} target="_blank" rel="noreferrer">
                  View latest release <Download className="size-4" />
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
              The app makes source readiness, mini-recorder access, provider state, credential
              storage, transcript segments, summary state, update status, reference context, and
              export actions visible without turning the meeting record into a cloud dashboard.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['Mini mode', 'Whisper sidecar', 'OpenAI optional', 'Signed updater'].map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </MotionDiv>
        </div>
      </section>

      <section className="px-2 pb-12 sm:px-4">
        <div className="mx-auto grid max-w-6xl gap-7 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
          <MotionDiv
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45 }}
            className="border border-border bg-card/70 p-5 sm:p-6"
          >
            <div className="inline-flex items-center gap-2 border border-border px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <Minimize2 className="size-4 text-accent" />
              Mini mode
            </div>
            <h2 className="mt-4 text-2xl font-normal leading-tight text-foreground sm:text-3xl">
              Mini mode keeps recording controls beside the call.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              The compact recorder stays close to the call, while the full archive console keeps
              transcripts, summaries, reference context, and export work ready for review.
            </p>
            <div className="mt-5 grid gap-1 border border-border bg-border sm:grid-cols-2">
              {workflowNotes.map((note) => (
                <div key={note} className="bg-background/80 p-4 text-sm leading-6 text-muted-foreground">
                  {note}
                </div>
              ))}
            </div>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45 }}
          >
            <MiniRecorderFrame />
          </MotionDiv>
        </div>
      </section>

      <section className="px-2 pb-12 sm:px-4">
        <div className="mx-auto max-w-6xl">
          <MobileScreenshotFrame />
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
