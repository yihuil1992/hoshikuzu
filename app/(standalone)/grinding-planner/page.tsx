'use client';

import { useMemo, useState } from 'react';

import { ExpCalculatorChart } from '@/components/grinding-planner/exp-calculator-chart';
import { ExpCalculatorForm } from '@/components/grinding-planner/exp-calculator-form';
import { ExpCalculatorHero } from '@/components/grinding-planner/exp-calculator-hero';
import { ExpCalculatorTable } from '@/components/grinding-planner/exp-calculator-table';
import { LevelPenaltyChartCard } from '@/components/grinding-planner/level-penalty-chart-card';
import { Separator } from '@/components/ui/separator';
import { computeBestMobs, MonsterScore } from '@/lib/exp-calculate';

export default function GrindingPlannerPage() {
  const [result, setResult] = useState<Record<number, MonsterScore[]> | null>(null);

  const flatRows = useMemo(() => {
    if (!result) return [];
    const rows: Array<MonsterScore & { playerLevel: number; rank: number }> = [];
    for (const [lvlStr, mobs] of Object.entries(result)) {
      const lvl = Number(lvlStr);
      mobs.forEach((m, idx) => {
        rows.push({ ...m, playerLevel: lvl, rank: idx + 1 });
      });
    }
    return rows.sort((a, b) =>
      a.playerLevel === b.playerLevel ? a.rank - b.rank : a.playerLevel - b.playerLevel,
    );
  }, [result]);

  const chartData = useMemo(() => {
    if (!result) return [];

    const levels = Object.keys(result)
      .map(Number)
      .sort((a, b) => a - b);

    return levels
      .map((lvl) => {
        const top = result[lvl]?.[0];
        if (!top) return null;

        return {
          level: lvl,
          hoursToLevel: top.timeToLevelSec / 3600,
        };
      })
      .filter(Boolean) as Array<{ level: number; hoursToLevel: number }>;
  }, [result]);

  return (
    <div className="min-h-dvh bg-[radial-gradient(1200px_600px_at_50%_-100px,theme(colors.sky.100/.6),transparent),radial-gradient(800px_400px_at_120%_-50px,theme(colors.pink.100/.6),transparent)]">
      <ExpCalculatorHero />

      <Separator className="mx-auto max-w-5xl" />

      <section className="space-y-8 px-6 py-10 sm:px-10 md:px-16 lg:px-20">
        {/* 顶部：表单 + 等级惩罚图 */}
        <div className="grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <ExpCalculatorForm
            onCalculate={({
              startLevel,
              endLevel,
              extraExpMultiplier,
              baseDps,
              topN,
              onlyNormal,
            }) => {
              const data = computeBestMobs(
                startLevel,
                endLevel,
                extraExpMultiplier,
                baseDps,
                topN,
                {
                  onlyNormal,
                },
              );
              setResult(data);
            }}
          />
          <LevelPenaltyChartCard />
        </div>

        <div className="space-y-6">
          <ExpCalculatorChart data={chartData} />
          <ExpCalculatorTable rows={flatRows} />
        </div>

        <div className="mx-auto max-w-5xl rounded-xl border bg-card p-4 text-xs text-muted-foreground">
          ここでの計算結果は HP・経験値テーブル・レベル補正などに基づいた概算です。
          実際の効率は装備・沸き具合・ラグなどによって変動するため、
          厳密なシミュレーターではなくレベリング計画用の目安として利用してください。
        </div>
      </section>
    </div>
  );
}
