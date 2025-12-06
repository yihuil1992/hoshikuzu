'use client';

import { LineChart as LineChartIcon } from 'lucide-react';
import { useQueryState, parseAsFloat, parseAsInteger, parseAsBoolean } from 'nuqs';
import { useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type ExpCalculatorFormProps = {
  onCalculate: (params: {
    startLevel: number;
    endLevel: number;
    extraExpMultiplier: number;
    baseDps: number;
    topN: number;
    onlyNormal: boolean;
  }) => void;
};

// ---- 默认值 & LocalStorage key ----
const DEFAULT_START_LEVEL = 165;
const DEFAULT_END_LEVEL = 189;
const DEFAULT_EXP_MULT = 4.28;
const DEFAULT_DPS = 340_000;
const DEFAULT_TOP_N = 3;
const DEFAULT_ONLY_NORMAL = true;

const STORAGE_KEY = 'exp-calculator-form';

type StoredValues = {
  startLevel: number;
  endLevel: number;
  expMult: number;
  dps: number;
  topN: number;
  onlyNormal: boolean;
};

export function ExpCalculatorForm({ onCalculate }: ExpCalculatorFormProps) {
  const [startLevel, setStartLevel] = useQueryState(
    'start',
    parseAsInteger.withDefault(DEFAULT_START_LEVEL),
  );
  const [endLevel, setEndLevel] = useQueryState(
    'end',
    parseAsInteger.withDefault(DEFAULT_END_LEVEL),
  );
  const [expMult, setExpMult] = useQueryState('exp', parseAsFloat.withDefault(DEFAULT_EXP_MULT));
  const [dps, setDps] = useQueryState('dps', parseAsFloat.withDefault(DEFAULT_DPS));
  const [topN, setTopN] = useQueryState('top', parseAsInteger.withDefault(DEFAULT_TOP_N));

  // 野外のみ（area === 'normal'）
  const [onlyNormal, setOnlyNormal] = useQueryState(
    'field',
    parseAsBoolean.withDefault(DEFAULT_ONLY_NORMAL),
  );

  // ---- 从 localStorage 读取（URL 优先）----
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    let stored: Partial<StoredValues>;
    try {
      stored = JSON.parse(raw);
    } catch {
      return;
    }

    const search = new URLSearchParams(window.location.search);
    const hasStart = search.has('start');
    const hasEnd = search.has('end');
    const hasExp = search.has('exp');
    const hasDps = search.has('dps');
    const hasTop = search.has('top');
    const hasField = search.has('field');

    if (!hasStart && typeof stored.startLevel === 'number') {
      setStartLevel(stored.startLevel);
    }
    if (!hasEnd && typeof stored.endLevel === 'number') {
      setEndLevel(stored.endLevel);
    }
    if (!hasExp && typeof stored.expMult === 'number') {
      setExpMult(stored.expMult);
    }
    if (!hasDps && typeof stored.dps === 'number') {
      setDps(stored.dps);
    }
    if (!hasTop && typeof stored.topN === 'number') {
      setTopN(stored.topN);
    }
    if (!hasField && typeof stored.onlyNormal === 'boolean') {
      setOnlyNormal(stored.onlyNormal);
    }
  }, [setStartLevel, setEndLevel, setExpMult, setDps, setTopN, setOnlyNormal]);

  const saveToLocalStorage = (values: StoredValues) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  };

  const handleSubmit = () => {
    if (!startLevel || !endLevel || !expMult || !dps || !topN) return;

    const payload: StoredValues = {
      startLevel,
      endLevel,
      expMult,
      dps,
      topN,
      onlyNormal: !!onlyNormal,
    };

    // 保存到 localStorage
    saveToLocalStorage(payload);

    onCalculate({
      startLevel: payload.startLevel,
      endLevel: payload.endLevel,
      extraExpMultiplier: payload.expMult,
      baseDps: payload.dps,
      topN: payload.topN,
      onlyNormal: payload.onlyNormal,
    });
  };

  const handleReset = () => {
    // 重置为默认值（URL + localStorage 一起刷新）
    setStartLevel(DEFAULT_START_LEVEL);
    setEndLevel(DEFAULT_END_LEVEL);
    setExpMult(DEFAULT_EXP_MULT);
    setDps(DEFAULT_DPS);
    setTopN(DEFAULT_TOP_N);
    setOnlyNormal(DEFAULT_ONLY_NORMAL);

    saveToLocalStorage({
      startLevel: DEFAULT_START_LEVEL,
      endLevel: DEFAULT_END_LEVEL,
      expMult: DEFAULT_EXP_MULT,
      dps: DEFAULT_DPS,
      topN: DEFAULT_TOP_N,
      onlyNormal: DEFAULT_ONLY_NORMAL,
    });
  };

  return (
    <Card className="mx-auto max-w-5xl border-muted/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChartIcon className="h-5 w-5" />
          レベリング設定
        </CardTitle>
        <CardDescription>
          計算したいレベル帯と効率パラメータを入力してください。値は
          <span className="font-mono text-xs">
            {' '}
            ?start=&amp;end=&amp;exp=&amp;dps=&amp;top=&amp;field=
          </span>
          として URL クエリに保存されます。
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-md border bg-muted/40 px-3 py-3 md:px-4 md:py-4">
          <div className="grid gap-4 md:grid-cols-5">
            {/* レベル帯 */}
            <div className="space-y-1">
              <Label htmlFor="startLevel" className="text-xs md:text-sm">
                開始レベル
              </Label>
              <Input
                id="startLevel"
                type="number"
                min={1}
                className="text-right"
                value={startLevel ?? ''}
                onChange={(e) => setStartLevel(parseInt(e.target.value || '0', 10))}
              />
              <p className="mt-0.5 text-[11px] text-muted-foreground">例: 165</p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="endLevel" className="text-xs md:text-sm">
                終了レベル
              </Label>
              <Input
                id="endLevel"
                type="number"
                min={1}
                className="text-right"
                value={endLevel ?? ''}
                onChange={(e) => setEndLevel(parseInt(e.target.value || '0', 10))}
              />
              <p className="mt-0.5 text-[11px] text-muted-foreground">例: 189</p>
            </div>

            {/* 効率パラメータ */}
            <div className="space-y-1">
              <Label htmlFor="expMult" className="text-xs md:text-sm">
                経験値倍率
              </Label>
              <Input
                id="expMult"
                type="number"
                step="0.01"
                min={0}
                className="text-right"
                value={expMult ?? ''}
                onChange={(e) => setExpMult(parseFloat(e.target.value || '0'))}
              />
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                装備・バフ・イベントなどを含めた合計倍率
              </p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="dps" className="text-xs md:text-sm">
                平均 DPS
              </Label>
              <Input
                id="dps"
                type="number"
                min={1}
                className="text-right"
                value={dps ?? ''}
                onChange={(e) =>
                  setDps(e.target.value === '' ? 0 : parseFloat(e.target.value || '0') || 0)
                }
              />
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                1 秒あたりの平均ダメージ（目安で OK）
              </p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="topN" className="text-xs md:text-sm">
                上位 N 件
              </Label>
              <Input
                id="topN"
                type="number"
                min={1}
                max={10}
                className="text-right"
                value={topN ?? ''}
                onChange={(e) => setTopN(parseInt(e.target.value || '0', 10))}
              />
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                各レベルで表示するおすすめ狩場の数
              </p>
            </div>
          </div>

          {/* 野外のみトグル */}
          <div className="mt-4 flex items-start justify-between gap-4 rounded-md bg-background/60 px-3 py-2">
            <div className="space-y-0.5">
              <div className="text-xs font-medium">フィールドモンスターのみ</div>
              <p className="text-[11px] text-muted-foreground">
                <span className="font-mono text-[10px]">area = &quot;normal&quot;</span>
                に該当するモンスターだけを計算対象にします（ダンジョン等を除外）。
              </p>
            </div>
            <Switch checked={!!onlyNormal} onCheckedChange={(checked) => setOnlyNormal(checked)} />
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="px-2 py-0.5 text-[11px]">
              URL 同期
            </Badge>
            <span>
              パラメータは URL
              クエリとブラウザに保存されるため、リンク共有や再訪問がしやすくなります。
            </span>
          </div>
          <div className="flex gap-2 self-end sm:self-auto">
            <Button variant="outline" size="sm" type="button" onClick={handleReset}>
              デフォルトにリセット
            </Button>
            <Button size="sm" onClick={handleSubmit}>
              計算する
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
