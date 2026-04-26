'use client';

import { LineChart } from 'lucide-react';

import { MotionDiv } from '@/components/motion-div';

export function ExpCalculatorHero() {
  return (
    <section className="relative px-2 pt-16 pb-8 sm:px-4">
      <MotionDiv
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-5xl"
      >
        <div className="inline-flex items-center gap-2 border border-white/14 bg-white/[0.03] px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <LineChart className="h-4 w-4 text-[#aad7dc]" />
          EXP カリキュレーター
        </div>

        <h1 className="mt-5 max-w-3xl text-4xl font-light leading-none sm:text-5xl">
          レベリングプランナー
        </h1>

        <p className="mt-4 max-w-3xl text-balance text-sm leading-6 text-muted-foreground">
          レベル帯・経験値倍率・DPS を入力すると、
          最も効率の良い狩場とレベルアップまでの所要時間を自動で計算します。
        </p>
      </MotionDiv>
    </section>
  );
}
