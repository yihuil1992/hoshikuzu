import { CalendarIcon, Database, EyeOff, FileText, LinkIcon, ShieldCheck } from 'lucide-react';

import type { CSSProperties } from 'react';

const sections = [
  {
    id: '01',
    title: 'What This Site Collects',
    icon: EyeOff,
    body: [
      'Hoshikuzu does not ask you to create an account, enter personal details, or submit payment information.',
      'The public pages are meant to be browsed quietly. The starfield, timers, calculators, and catalog pages can be used without sending personal information to Hoshikuzu.',
    ],
  },
  {
    id: '02',
    title: 'Local Preferences',
    icon: Database,
    body: [
      'Some interface choices are stored in your browser so the site can remember how you left it. For example, the archive sheet and night atlas theme preference is saved locally on your device.',
      'This local preference is not an account, is not shared with other visitors, and can be cleared through your browser storage settings.',
    ],
  },
  {
    id: '03',
    title: 'Third-Party Destinations',
    icon: LinkIcon,
    body: [
      'Some records may link to external websites, project repositories, Discord, or product pages. When you leave Hoshikuzu, the destination site may receive ordinary browser information and apply its own privacy policy.',
      'Hoshikuzu does not control those external services. Review their policies before sharing information with them.',
    ],
  },
  {
    id: '04',
    title: 'Operational Data',
    icon: ShieldCheck,
    body: [
      'Hosting providers, browsers, and security layers may process standard technical data such as request time, device type, or error details in order to deliver the site and keep it available.',
      'Hoshikuzu does not use this project to build advertising profiles or sell visitor data.',
    ],
  },
  {
    id: '05',
    title: 'Changes',
    icon: FileText,
    body: [
      'If the site adds accounts, analytics, submissions, or other features that materially change how data is handled, this policy should be updated before those features become part of the normal experience.',
      'The updated date below is the record to check when revisiting this page.',
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <article className="mx-auto max-w-5xl px-2 py-16 sm:px-4">
      <header className="grid gap-8 border-b border-border pb-10 lg:grid-cols-[1fr_18rem]">
        <div>
          <div className="flex items-center gap-3 text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            <span>Document</span>
            <span className="h-px w-16 bg-border" />
            <span>Privacy Record</span>
          </div>
          <h1 className="mt-6 text-4xl font-light leading-none tracking-normal text-foreground sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-muted-foreground">
            A plain-language record of what Hoshikuzu does with visitor data. The short version:
            this site is designed to work without accounts, tracking profiles, or personal data
            collection.
          </p>
        </div>

        <aside className="border border-border bg-card/70 p-5">
          <div className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Index Note
          </div>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Applies to</dt>
              <dd className="mt-1 text-foreground">Hoshikuzu website and browser tools</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Accounts</dt>
              <dd className="mt-1 text-foreground">Not required</dd>
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
                <a className="atlas-motion-link hover:text-foreground" href={`#privacy-${section.id}`}>
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
                id={`privacy-${section.id}`}
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
