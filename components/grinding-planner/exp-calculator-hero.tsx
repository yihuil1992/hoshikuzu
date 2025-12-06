'use client';

import { Sparkles } from 'lucide-react';

import { MotionDiv } from '@/components/motion-div';

export function ExpCalculatorHero() {
  return (
    <section className="relative px-6 pt-16 pb-8 sm:px-10 md:px-16 lg:px-20">
      <MotionDiv
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-4xl text-center"
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground bg-background/60 shadow-sm backdrop-blur">
          <Sparkles className="h-4 w-4" />
          EXP カリキュレーター
        </div>

        {/* Title */}
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">レベリングプランナー</h1>

        {/* Description */}
        <p className="mt-3 text-balance text-muted-foreground">
          レベル帯・経験値倍率・DPS を入力すると、
          最も効率の良い狩場とレベルアップまでの所要時間を自動で計算します。
        </p>
      </MotionDiv>
    </section>
  );
}
