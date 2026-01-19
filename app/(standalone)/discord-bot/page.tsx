'use client';

import { motion } from 'framer-motion';
import {
  Bot,
  Command,
  Bell,
  Users,
  Shield,
  Sparkles,
  Github,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

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
 * BotPage (Japanese)
 * - Tailwind v4 + shadcn/ui
 * - A marketing-style page that introduces the bot and its commands
 *
 * Drop into: app/(marketing)/bot/page.tsx (or similar)
 *
 * Notes:
 * - Replace BOT_INVITE_URL / SUPPORT_SERVER_URL / REPO_URL
 * - Replace commands to match your actual bot
 */

const BOT_NAME = 'Hoshikuzu Bot';
const BOT_TAGLINE = '必要な情報を、必要な人に、ちょうどよく。';

// TODO: replace these URLs
const BOT_INVITE_URL = 'https://discord.com/oauth2/authorize?client_id=1456103159473639444';
const SUPPORT_SERVER_URL: string | undefined = undefined;
const REPO_URL: string | undefined = undefined; // e.g. 'https://github.com/your/repo' (or keep undefined for private)

function CommandRow({ cmd, desc, example }: { cmd: string; desc: string; example?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <code className="rounded-md bg-muted px-2 py-1 text-sm">{cmd}</code>
            <span className="text-sm text-muted-foreground">{desc}</span>
          </div>
          {example ? (
            <div className="mt-2 text-xs text-muted-foreground">
              <span className="mr-2 inline-flex items-center rounded-full border bg-background px-2 py-0.5">
                例
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
  const [loading, setLoading] = useState(true);

  // This is a placeholder cover. Replace with an actual image or screenshot.
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border bg-gradient-to-br from-background to-muted">
      {loading ? <Skeleton className="absolute inset-0" /> : null}
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
            <Sparkles className="size-4" />
            {title}
          </div>
          <div className="mt-3 text-xs text-muted-foreground"></div>
        </div>
      </div>
      {/* trigger skeleton end */}
      <Image
        src="/assets/banner.png"
        alt="banner"
        width={1536}
        height={1024}
        className="h-full w-full object-cover"
        onLoad={() => setLoading(false)}
      />
    </div>
  );
}

export default function BotPage() {
  const features = useMemo(
    () => [
      {
        icon: Bell,
        title: 'ランキングを監視して通知',
        desc: '指定したチャンネルにランキング監視の更新を自動で通知します。',
      },
      {
        icon: Users,
        title: 'ギルドをフォローして履歴を見る',
        desc: '監視したいギルドを登録し、変動の履歴をコマンドで確認できます。',
      },
      {
        icon: Sparkles,
        title: 'ギルド変動を検知',
        desc: 'ランキング上のプレイヤーのギルド所属変動を追跡し、差分を分かりやすくまとめます。',
      },
      {
        icon: Command,
        title: 'コマンドは2系統だけ',
        desc: '「/guild」と「/rank」だけで運用できる、覚えやすい設計。',
      },
    ],
    [],
  );

  const commands = useMemo(
    () => [
      {
        group: 'ギルド監視',
        icon: Users,
        accent: 'from-emerald-500 via-green-600 to-teal-500',
        items: [
          {
            cmd: '/guild watch name:<ギルド名>',
            desc: '指定した Flyff ギルドをフォロー（監視対象に追加）します。',
            example: "/guild watch name:'ExampleGuild'",
          },
          {
            cmd: '/guild unwatch name:<ギルド名>',
            desc: '指定した Flyff ギルドのフォローを解除（監視対象から削除）します。',
            example: "/guild unwatch name:'ExampleGuild'",
          },
          {
            cmd: '/guild list',
            desc: 'フォロー中のギルド一覧を表示します。',
          },
          {
            cmd: '/guild history name:<ギルド名> limit:<1-50?>',
            desc: '指定ギルドの履歴（例：所属変動など）を表示します。',
            example: "/guild history name:'ExampleGuild' limit:20",
          },
        ],
      },
      {
        group: 'ランキング監視',
        icon: Bell,
        accent: 'from-sky-500 via-blue-600 to-indigo-500',
        items: [
          {
            cmd: '/rank channel target:<チャンネル>',
            desc: 'ランキング監視の通知チャンネルを設定します。',
            example: '#rank-watch を指定',
          },
        ],
      },
    ],
    [],
  );

  return (
    <div className="min-h-dvh bg-[radial-gradient(1200px_600px_at_50%_-100px,theme(colors.sky.100/.6),transparent),radial-gradient(800px_400px_at_120%_-50px,theme(colors.pink.100/.6),transparent)]">
      {/* Hero */}
      <section className="relative px-6 sm:px-10 md:px-16 lg:px-20 pt-16 pb-8">
        <MotionDiv
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-6xl"
        >
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground bg-background/60 shadow-sm backdrop-blur">
              <Sparkles className="size-4" />
              Discord utilities
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{BOT_NAME}</h1>
            <p className="mt-3 text-balance text-muted-foreground">{BOT_TAGLINE}</p>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild className="gap-2">
                <Link href={BOT_INVITE_URL} target="_blank" rel="noreferrer">
                  サーバーに追加 <ExternalLink className="size-4" />
                </Link>
              </Button>
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
                    <Github className="size-4" /> Source
                  </Link>
                </Button>
              ) : (
                <div className="text-xs text-muted-foreground">Private repo</div>
              )}
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-4xl">
            <BotCover title="Bot overview" />
          </div>
        </MotionDiv>
      </section>

      <Separator className="mx-auto max-w-6xl" />

      {/* Features */}
      <section className="px-6 sm:px-10 md:px-16 lg:px-20 py-10">
        <div className="mx-auto max-w-6xl">
          <MotionDiv
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground bg-background/60 shadow-sm backdrop-blur">
              <Bot className="size-4" />
              概要
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">できること</h2>
            <p className="mt-2 text-muted-foreground">
              Flyff のランキングを継続監視し、ランキング上のプレイヤーの
              <strong>ギルド所属変動</strong>を検知して通知します。
              監視対象ギルドの登録・解除・一覧表示・履歴確認まで、最小限の操作で完結します。
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
                  <Card className="rounded-2xl border-muted/60 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <span className="grid size-9 place-items-center rounded-xl border bg-background">
                          <Icon className="size-5" />
                        </span>
                        {f.title}
                      </CardTitle>
                      <CardDescription>{f.desc}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="rounded-full">
                          Slash Commands
                        </Badge>
                        <Badge variant="secondary" className="rounded-full">
                          Roles
                        </Badge>
                        <Badge variant="secondary" className="rounded-full">
                          Notifications
                        </Badge>
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

      {/* Commands */}
      <section className="px-6 sm:px-10 md:px-16 lg:px-20 py-10">
        <div className="mx-auto max-w-6xl">
          <MotionDiv
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground bg-background/60 shadow-sm backdrop-blur">
              <Command className="size-4" />
              コマンド
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              使い方（代表例）
            </h2>
            <p className="mt-2 text-muted-foreground">
              よく使うコマンドだけを掲載しています。実際の運用に合わせて自由に差し替えてください。
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
                  <Card className="group relative overflow-hidden border-muted/60 rounded-2xl">
                    <div
                      aria-hidden
                      className={`pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r ${c.accent} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-25`}
                    />
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="size-5" /> {c.group}
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
                    <CardFooter className="justify-between">
                      {SUPPORT_SERVER_URL && (
                        <Button asChild size="sm" variant="outline" className="gap-2">
                          <Link href={SUPPORT_SERVER_URL} target="_blank" rel="noreferrer">
                            詳細 <ExternalLink className="size-4" />
                          </Link>
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </MotionDiv>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="px-6 sm:px-10 md:px-16 lg:px-20 pb-16">
        <div className="mx-auto max-w-6xl rounded-2xl border bg-card p-6 text-center text-sm text-muted-foreground">
          <div className="mx-auto max-w-3xl">
            <span className="font-medium text-foreground">{BOT_NAME}</span>{' '}
            は特定サーバー向けに調整される場合があります。機能・コマンドは予告なく追加・変更されることがあります。
          </div>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Button asChild size="sm" className="gap-2">
              <Link href={BOT_INVITE_URL} target="_blank" rel="noreferrer">
                導入する <ExternalLink className="size-4" />
              </Link>
            </Button>
            {SUPPORT_SERVER_URL && (
              <Button asChild size="sm" variant="outline" className="gap-2">
                <Link href={SUPPORT_SERVER_URL} target="_blank" rel="noreferrer">
                  サポート <ExternalLink className="size-4" />
                </Link>
              </Button>
            )}
          </div>
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
