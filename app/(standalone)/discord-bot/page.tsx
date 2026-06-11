'use client';

import {
  Bot,
  Command,
  Bell,
  Users,
  Sparkles,
  Github,
  ExternalLink,
  Copy,
  Check,
  Volume2,
  Database,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { MotionDiv } from '@/components/motion-div';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const BOT_NAME = 'Hoshikuzu Bot';
const BOT_TAGLINE = 'Flyff Universe のギルドチェック、メンバー照会、プレイヤー名の発音リンクまで。';

const SUPPORT_SERVER_URL: string | undefined = undefined;
const REPO_URL = 'https://github.com/Startust/hoshikuzu-bot';

const features = [
  {
    icon: Bell,
    title: 'ランキング更新を定期チェック',
    desc: '設定された Flyff サーバーのランキングを取得し、スナップショットと差分を保存します。',
    badges: ['Polling', 'Snapshots', 'Diffs'],
  },
  {
    icon: Users,
    title: '加入・脱退・移籍・改名を通知',
    desc: 'フォロー中のギルドで起きた所属変動や名前変更を、指定チャンネルにまとめて通知します。',
    badges: ['Join / Leave', 'Transfer', 'Rename'],
  },
  {
    icon: Command,
    title: 'メンバー一覧と履歴を slash command で',
    desc: 'ギルドの現在メンバー、フォロー状況、履歴を Discord 上から確認できます。',
    badges: ['/guild', '/rank', 'Autocomplete'],
  },
  {
    icon: Volume2,
    title: 'プレイヤー名の発音リンク',
    desc: '音声が用意されている名前には、通知やメンバー一覧から発音を聞けるリンクを添えます。',
    badges: ['Audio Links', 'Local TTS', 'S3'],
  },
  {
    icon: Database,
    title: 'Prisma + MySQL で履歴を保持',
    desc: 'ランキング、ギルドメンバー、イベント、発音 URL をデータベースに蓄積します。',
    badges: ['Prisma', 'MySQL', 'Events'],
  },
  {
    icon: ShieldCheck,
    title: '導入先を allowlist で管理',
    desc: '管理用サーバーから許可済み Discord guild を管理し、想定外の参加を抑制します。',
    badges: ['Allowlist', 'Owner Ops', 'Safety'],
  },
];

const commands = [
  {
    group: 'ギルドチェック',
    icon: Users,
    items: [
      {
        cmd: '/guild watch name:<ギルド名>',
        desc: '指定した Flyff ギルドをフォローします。',
        example: "/guild watch name:'ExampleGuild'",
      },
      {
        cmd: '/guild unwatch name:<ギルド名>',
        desc: '指定した Flyff ギルドのフォローを解除します。',
        example: "/guild unwatch name:'ExampleGuild'",
      },
      {
        cmd: '/guild list',
        desc: 'フォロー中のギルド一覧を表示します。',
      },
      {
        cmd: '/guild history name:<ギルド名> limit:<1-50?>',
        desc: '加入、脱退、移籍、改名などの履歴をページ付きで表示します。',
        example: "/guild history name:'ExampleGuild' limit:20",
      },
      {
        cmd: '/guild members name:<ギルド名>',
        desc: 'ランキング上の現在メンバーを表示し、発音音声があればリンクを添えます。',
        example: "/guild members name:'ExampleGuild'",
      },
    ],
  },
  {
    group: 'ランキング通知設定',
    icon: Bell,
    items: [
      {
        cmd: '/rank channel target:<チャンネル>',
        desc: 'ランキング更新通知を送信するテキストチャンネルを設定します。',
        example: '#rank-watch を指定',
      },
    ],
  },
  {
    group: '管理者向け',
    icon: ShieldCheck,
    items: [
      {
        cmd: '/allowlist add guild_id:<Discord Guild ID> note:<任意>',
        desc: 'Bot の参加を許可するサーバーを追加します。',
      },
      {
        cmd: '/allowlist remove guild_id:<Discord Guild ID>',
        desc: '許可済みサーバーを allowlist から削除します。',
      },
      {
        cmd: '/allowlist list limit:<1-100?>',
        desc: '登録済み allowlist を確認します。',
      },
    ],
  },
];

function CommandRow({ cmd, desc, example }: { cmd: string; desc: string; example?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex flex-col gap-2 border border-border bg-secondary/35 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <code className="rounded-[2px] border border-border bg-background px-2 py-1 text-sm text-foreground">
              {cmd}
            </code>
            <span className="text-sm text-muted-foreground">{desc}</span>
          </div>
          {example ? (
            <div className="mt-2 text-xs text-muted-foreground">
              <span className="mr-2 inline-flex items-center rounded-full border bg-background px-2 py-0.5">
                EX
              </span>
              <code className="break-words">{example}</code>
            </div>
          ) : null}
        </div>

        <Button
          type="button"
          size="icon"
          variant="outline"
          className="shrink-0"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(cmd);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1200);
            } catch {
              // ignore
            }
          }}
          aria-label="Copy command"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </Button>
      </div>
    </div>
  );
}

function BotCover({ title }: { title: string }) {
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[2px] border border-border bg-background">
      <div
        aria-hidden
        className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:72px_72px]"
      />
      <div className="absolute inset-x-0 top-0 flex h-10 items-center justify-between border-b border-border px-4">
        <div className="inline-flex items-center gap-2 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <Sparkles className="size-4 text-accent" />
          {title}
        </div>
        <div className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          live signal
        </div>
      </div>
      <div className="absolute inset-0 grid place-items-center pt-10">
        <div className="grid w-[min(32rem,82%)] gap-3">
          {['guild members', 'pronunciation link', 'rank notification'].map((label, index) => (
            <div
              key={label}
              className="flex items-center justify-between border border-border bg-card/55 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {label}
                </span>
              </div>
              <span className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                0{index + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BotPage() {
  return (
    <div lang="ja" className="min-h-dvh">
      <section className="relative px-2 pt-16 pb-8 sm:px-4">
        <MotionDiv
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-6xl"
        >
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 border border-border bg-card/45 px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <Sparkles className="size-4 text-accent" />
              Discord Signal
            </div>
            <h1 className="mt-5 text-4xl font-light leading-none text-foreground sm:text-5xl">
              {BOT_NAME}
            </h1>
            <p className="mt-4 text-balance text-sm leading-6 text-muted-foreground">
              {BOT_TAGLINE}
            </p>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {SUPPORT_SERVER_URL && (
                <Button asChild variant="outline" className="gap-2">
                  <Link href={SUPPORT_SERVER_URL} target="_blank" rel="noreferrer">
                    サポート / 連絡先 <ExternalLink className="size-4" />
                  </Link>
                </Button>
              )}
              {REPO_URL ? (
                <Button asChild variant="outline" className="gap-2">
                  <Link href={REPO_URL} target="_blank" rel="noreferrer">
                    <Github className="size-4" /> GitHub
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-4xl">
            <BotCover title="Bot overview" />
          </div>
        </MotionDiv>
      </section>

      <Separator className="mx-auto max-w-6xl" />

      <section className="px-2 py-10 sm:px-4">
        <div className="mx-auto max-w-6xl">
          <MotionDiv
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45 }}
            className="mx-auto max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 border border-border px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <Bot className="size-4 text-accent" />
              概要
            </div>
            <h2 className="mt-4 text-2xl font-normal sm:text-3xl">できること</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Flyff のランキングを定期的にチェックし、
              <strong>ギルド所属変動</strong>と<strong>プレイヤー名の発音</strong>を Discord
              の運用画面に届けます。
              対象ギルドの登録、履歴確認、現在メンバー照会まで最小限の操作で完結します。
            </p>
          </MotionDiv>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <MotionDiv
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: i * 0.05 }}
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-3 normal-case tracking-normal">
                        <span className="grid size-9 place-items-center border border-border bg-background">
                          <Icon className="size-5" />
                        </span>
                        {f.title}
                      </CardTitle>
                      <CardDescription>{f.desc}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-2">
                        {f.badges.map((badge) => (
                          <Badge key={badge} variant="secondary">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </MotionDiv>
              );
            })}
          </div>
        </div>
      </section>

      <Separator className="mx-auto max-w-6xl" />

      <section className="px-2 py-10 sm:px-4">
        <div className="mx-auto max-w-6xl">
          <MotionDiv
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45 }}
            className="mx-auto max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 border border-border px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <Command className="size-4 text-accent" />
              コマンド
            </div>
            <h2 className="mt-4 text-2xl font-normal sm:text-3xl">使い方（代表例）</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              公開されている slash command と、管理用 allowlist command の主要な使い方です。
            </p>
          </MotionDiv>

          <div className="mt-8 grid grid-cols-1 gap-6">
            {commands.map((c, i) => {
              const Icon = c.icon;
              return (
                <MotionDiv
                  key={c.group}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.45, delay: i * 0.05 }}
                >
                  <Card className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 normal-case tracking-normal">
                        <Icon className="size-5 text-accent" /> {c.group}
                      </CardTitle>
                      <CardDescription>
                        コピーアイコンでコマンドをワンクリックコピーできます。
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {c.items.map((it) => (
                        <CommandRow key={it.cmd} cmd={it.cmd} desc={it.desc} example={it.example} />
                      ))}
                    </CardContent>
                  </Card>
                </MotionDiv>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-2 pb-16 sm:px-4">
        <div className="mx-auto max-w-6xl border border-border bg-card/70 p-6 text-center text-sm leading-6 text-muted-foreground">
          <div className="mx-auto max-w-3xl">
            <span className="font-medium text-foreground">{BOT_NAME}</span> は Flyff Universe
            のギルドチェック向けに調整されています。発音音声は事前生成済みの名前にのみ表示されます。
          </div>
          <div className="mt-4 flex items-center justify-center gap-3">
            {SUPPORT_SERVER_URL && (
              <Button asChild size="sm" variant="outline" className="gap-2">
                <Link href={SUPPORT_SERVER_URL} target="_blank" rel="noreferrer">
                  サポート <ExternalLink className="size-4" />
                </Link>
              </Button>
            )}
            <Button asChild size="sm" variant="outline" className="gap-2">
              <Link href={REPO_URL} target="_blank" rel="noreferrer">
                <Github className="size-4" /> GitHub
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
