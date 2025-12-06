import { JSX } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MonsterScore } from '@/lib/exp-calculate';

type Row = MonsterScore & { playerLevel: number; rank: number };

type ExpCalculatorTableProps = {
  rows: Row[];
};

export function ExpCalculatorTable({ rows }: ExpCalculatorTableProps) {
  if (!rows.length) return null;

  // rows 已经按 level + rank 排好序了
  const bodyRows: JSX.Element[] = [];
  let lastLevel: number | null = null;
  let isAltGroup = false; // 用于实现“按 level 斑马纹”的标记

  for (const row of rows) {
    const levelChanged = row.playerLevel !== lastLevel;

    // 每个 level 前插入一行组头
    if (levelChanged) {
      isAltGroup = !isAltGroup;
      const groupHeaderBg = isAltGroup ? 'bg-muted/70' : 'bg-muted/40';

      bodyRows.push(
        <TableRow
          key={`group-${row.playerLevel}`}
          className={`${groupHeaderBg} hover:${groupHeaderBg} border-t`}
        >
          <TableCell
            colSpan={9}
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Level {row.playerLevel}
          </TableCell>
        </TableRow>,
      );
      lastLevel = row.playerLevel;
    }

    const groupRowBg = isAltGroup ? 'bg-muted/10' : '';

    bodyRows.push(
      <TableRow
        key={`${row.playerLevel}-${row.rank}-${row.id}`}
        className={`hover:bg-muted/40 ${groupRowBg} ${row.rank === 1 ? 'bg-primary/5' : ''}`}
      >
        {/* Level 列：在普通行中隐藏（内容透明，保留列宽） */}
        <TableCell className="text-xs text-transparent select-none">{row.playerLevel}</TableCell>
        <TableCell className="text-xs text-muted-foreground">{row.rank}</TableCell>
        <TableCell className="max-w-[180px] truncate">{row.name}</TableCell>
        <TableCell className="text-right tabular-nums text-xs">{row.monsterLevel}</TableCell>
        <TableCell className="text-right tabular-nums text-xs">
          {row.diff >= 0 ? `+${row.diff}` : row.diff}
        </TableCell>
        <TableCell className="text-right tabular-nums text-xs">
          {row.expPerKill.toFixed(4)}%
        </TableCell>
        <TableCell className="text-right tabular-nums text-xs">{row.killsToLevel}</TableCell>
        <TableCell className="text-right tabular-nums text-xs">
          {row.timePerKillSec.toFixed(2)}
        </TableCell>
        <TableCell className="text-right tabular-nums text-xs">
          {(row.timeToLevelSec / 3600).toFixed(1)}
        </TableCell>
      </TableRow>,
    );
  }

  return (
    <Card className="mx-auto max-w-5xl border-muted/60">
      <CardHeader>
        <CardTitle>レベル帯ごとのおすすめ狩場</CardTitle>
        <CardDescription>
          指定したレベル範囲内で、各レベルごとのおすすめモンスターと経験値・時間の目安です。
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">レベル</TableHead>
              <TableHead className="w-[60px]">順位</TableHead>
              <TableHead>モンスター</TableHead>
              <TableHead className="text-right">モブLv</TableHead>
              <TableHead className="text-right">レベル差</TableHead>
              <TableHead className="text-right">経験値 / 1体</TableHead>
              <TableHead className="text-right">必要討伐数</TableHead>
              <TableHead className="text-right">討伐時間 (秒)</TableHead>
              <TableHead className="text-right">レベルアップまで (時間)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{bodyRows}</TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
