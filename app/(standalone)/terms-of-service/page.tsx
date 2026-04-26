import {
  CalendarIcon,
  Compass,
  FileText,
  Handshake,
  LinkIcon,
  ShieldCheckIcon,
  Wrench,
} from 'lucide-react';

import type { CSSProperties } from 'react';

const sections = [
  {
    id: '01',
    title: 'Using Hoshikuzu',
    icon: Compass,
    body: [
      'Hoshikuzu is a personal index of small tools, work samples, and experiments. You may browse the site and use the available tools for personal, informational, and exploratory purposes.',
      'Please do not misuse the site, interfere with its availability, attempt to bypass security controls, or use the tools in a way that harms other people or services.',
    ],
  },
  {
    id: '02',
    title: 'Tools And Outputs',
    icon: Wrench,
    body: [
      'Calculators, timers, previews, and other interactive surfaces are provided as lightweight utilities. Their outputs may contain mistakes, edge cases, or assumptions that do not match your situation.',
      'You are responsible for checking important results before relying on them. Hoshikuzu should not be treated as professional, legal, financial, medical, or operational advice.',
    ],
  },
  {
    id: '03',
    title: 'External Links',
    icon: LinkIcon,
    body: [
      'Some pages link to external websites, repositories, Discord destinations, or product experiences. Those destinations are operated by their respective owners.',
      'Hoshikuzu is not responsible for third-party content, availability, policies, or transactions after you leave this site.',
    ],
  },
  {
    id: '04',
    title: 'Ownership And Credits',
    icon: FileText,
    body: [
      'The site design, writing, interface code, and original visual presentation belong to the project owner unless otherwise noted.',
      'Referenced brands, libraries, frameworks, screenshots, and linked projects remain the property of their respective owners. Open-source dependencies retain their own licenses.',
    ],
  },
  {
    id: '05',
    title: 'Availability',
    icon: ShieldCheckIcon,
    body: [
      'Hoshikuzu is provided as-is and may change, pause, break, move, or disappear without prior notice.',
      'There is no promise that every experiment, link, or tool will remain available forever. The site is maintained as a living archive, not a guaranteed service contract.',
    ],
  },
  {
    id: '06',
    title: 'Updates To These Terms',
    icon: Handshake,
    body: [
      'These terms may be revised when the site changes or when clearer language is needed.',
      'Continuing to use the site after an update means you accept the current version of the terms shown on this page.',
    ],
  },
];

export default function TermsOfService() {
  return (
    <article className="mx-auto max-w-5xl px-2 py-16 sm:px-4">
      <header className="grid gap-8 border-b border-border pb-10 lg:grid-cols-[1fr_18rem]">
        <div>
          <div className="flex items-center gap-3 text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            <span>Document</span>
            <span className="h-px w-16 bg-border" />
            <span>Use Terms</span>
          </div>
          <h1 className="mt-6 text-4xl font-light leading-none tracking-normal text-foreground sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-muted-foreground">
            The working terms for using Hoshikuzu: a small archive of tools, references, and
            experiments. These notes are written to be readable first, precise second, and dramatic
            never.
          </p>
        </div>

        <aside className="border border-border bg-card/70 p-5">
          <div className="flex items-center gap-2 text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <ShieldCheckIcon className="size-4 text-accent" />
            Service Record
          </div>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Scope</dt>
              <dd className="mt-1 text-foreground">Website, tools, and linked archive pages</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Use</dt>
              <dd className="mt-1 text-foreground">Personal, informational, exploratory</dd>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarIcon className="size-4" />
              <span>Last updated: April 26, 2026</span>
            </div>
          </dl>
        </aside>
      </header>

      <div className="grid gap-6 py-10 lg:grid-cols-[14rem_1fr]">
        <nav className="hidden self-start border border-border bg-card/55 p-4 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground lg:block">
          <div className="mb-4 text-foreground">Contents</div>
          <ol className="space-y-3">
            {sections.map((section) => (
              <li key={section.id}>
                <a className="atlas-motion-link hover:text-foreground" href={`#terms-${section.id}`}>
                  {section.id} {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-5">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <section
                key={section.id}
                id={`terms-${section.id}`}
                className="atlas-document-section border border-border bg-card/70 p-5 sm:p-6"
                style={{ '--atlas-delay': `${Number(section.id) * 45}ms` } as CSSProperties}
              >
                <div className="flex items-start gap-4">
                  <div className="grid size-10 shrink-0 place-items-center border border-border bg-background/70 text-accent">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      {section.id}
                    </div>
                    <h2 className="mt-2 text-xl font-normal tracking-normal text-foreground">
                      {section.title}
                    </h2>
                    <div className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                      {section.body.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </article>
  );
}
