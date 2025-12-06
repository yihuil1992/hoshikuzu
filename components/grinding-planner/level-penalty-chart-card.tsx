'use client';

import Image from 'next/image';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function LevelPenaltyChartCard() {
  return (
    <Card className="h-full border-muted/60">
      <CardHeader>
        <CardTitle className="text-sm">レベル差ペナルティ</CardTitle>
        <CardDescription className="text-xs">
          プレイヤーLvとモンスターLvの差によるダメージおよび獲得EXP補正率の参考グラフです。
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-2">
        {/* v5 正确用法 */}
        <Zoom
          zoomImg={{
            src: '/assets/level_gap.png',
            alt: 'level gap enlarged',
          }}
        >
          <Image
            src="/assets/level_gap.png"
            alt="level gap"
            width={900}
            height={650}
            className="max-h-48 w-auto cursor-zoom-in object-contain"
          />
        </Zoom>

        <p className="text-[11px] text-muted-foreground">
          画像をクリックすると拡大表示、もう一度クリックすると元に戻ります。
        </p>
      </CardContent>
    </Card>
  );
}
