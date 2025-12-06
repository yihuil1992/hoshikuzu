'use client';

import { useState } from 'react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

type ExpChartPoint = { level: number; hoursToLevel: number };

type ExpCalculatorChartProps = {
  data: ExpChartPoint[];
};

const chartConfig = {
  hoursToLevel: {
    label: 'レベルアップまでの時間',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

export function ExpCalculatorChart({ data }: ExpCalculatorChartProps) {
  const [activePoint, setActivePoint] = useState<ExpChartPoint | null>(null);
  if (!data.length) return null;

  const fallbackPoint = data[data.length - 1]; // デフォは一番高いレベル
  const current = activePoint ?? fallbackPoint;

  return (
    <Card className="mx-auto max-w-5xl border-muted/60">
      <CardHeader>
        <CardTitle>トップ1・レベルアップ所要時間</CardTitle>
        <CardDescription>
          選択したレベル帯で、最も効率の良いモンスターを狩った場合のレベルアップに必要な時間の目安です。
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[260px] w-full">
          <LineChart
            data={data}
            onMouseMove={(state) => {
              const payload = state?.activePayload?.[0]?.payload as ExpChartPoint | undefined;
              if (payload) setActivePoint(payload);
            }}
            onMouseLeave={() => setActivePoint(null)}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />

            <XAxis
              dataKey="level"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: number) => `Lv ${value}`}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: number) => value.toFixed(1)}
            />

            <ChartTooltip
              content={<ChartTooltipContent labelFormatter={(label) => `レベル ${label}`} />}
            />

            <Line
              type="monotone"
              dot={false}
              dataKey="hoursToLevel"
              stroke="var(--color-hoursToLevel)"
              strokeWidth={2}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>

        {/* Hover 対応の stats セクション */}
        <div className="mt-4 rounded-md border bg-muted/40 px-3 py-2 text-xs sm:text-sm">
          {current ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  現在のレベル
                </div>
                <div className="text-lg font-semibold sm:text-2xl">Lv {current.level}</div>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  レベルアップまで
                </div>
                <div className="text-lg font-semibold sm:text-2xl">
                  {current.hoursToLevel.toFixed(2)}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">時間</span>
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground sm:text-xs">
                グラフ上のポイントにマウスオーバーすると、そのレベルの詳細が表示されます。
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-muted-foreground sm:text-xs">
              グラフ上のポイントにマウスオーバーすると、そのレベルの所要時間がここに表示されます。
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
