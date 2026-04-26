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

// NOTE: HP 与 BaseExp 都放在 Name 下方，因此表头不需要再加新列
const HEADER_COLS: { key: string; label: string; className?: string }[] = [
  { key: 'playerLevel', label: 'レベル', className: 'w-[80px]' },
  { key: 'rank', label: '順位', className: 'w-[60px]' },
  { key: 'name', label: 'モンスター' },
  { key: 'monsterLevel', label: 'モブLv', className: 'text-right' },
  { key: 'diff', label: 'レベル差', className: 'text-right' },
  { key: 'expPerKill', label: '経験値 / 1体', className: 'text-right' },
  { key: 'killsToLevel', label: '必要討伐数', className: 'text-right' },
  { key: 'timePerKillSec', label: '討伐時間 (秒)', className: 'text-right' },
  { key: 'timeToLevelSec', label: 'レベルアップまで (時間)', className: 'text-right' },
];

export function ExpCalculatorTable({ rows }: ExpCalculatorTableProps) {
  if (!rows.length) return null;

  const bodyRows: JSX.Element[] = [];
  let lastLevel: number | null = null;
  let isAltGroup = false;

  for (const row of rows) {
    const levelChanged = row.playerLevel !== lastLevel;

    if (levelChanged) {
      isAltGroup = !isAltGroup;
      const groupHeaderBg = isAltGroup ? 'bg-white/[0.07]' : 'bg-white/[0.04]';

      bodyRows.push(
        <TableRow
          key={`group-${row.playerLevel}`}
          className={`${groupHeaderBg} border-t border-white/12`}
        >
          <TableCell
            colSpan={HEADER_COLS.length}
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Level {row.playerLevel}
          </TableCell>
        </TableRow>,
      );

      lastLevel = row.playerLevel;
    }

    const groupRowBg = isAltGroup ? 'bg-white/[0.025]' : '';

    bodyRows.push(
      <TableRow
        key={`${row.playerLevel}-${row.rank}-${row.id}`}
        className={`${groupRowBg} ${row.rank === 1 ? 'bg-primary/10 text-foreground' : ''}`}
      >
        {/* Level 列隐藏文本但保留宽度 */}
        <TableCell className="text-xs text-transparent select-none">{row.playerLevel}</TableCell>

        <TableCell className="text-xs text-muted-foreground">{row.rank}</TableCell>

        {/* 🆕 Name + HP + EXP（两行显示） */}
        <TableCell className="max-w-[220px]">
          <div className="flex flex-col leading-tight">
            <span className="truncate">{row.name}</span>

            <span className="text-[10px] text-muted-foreground truncate">
              HP: {row.hp.toLocaleString()} ・ EXP: {row.baseExp}%
            </span>
          </div>
        </TableCell>

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
    <Card className="mx-auto max-w-5xl">
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
              {HEADER_COLS.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>{bodyRows}</TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
