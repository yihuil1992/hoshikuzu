import monstersJson from './monsters.json';
// 升一级经验条：0 → 100%
const EXP_TO_LEVEL = 100;

// ====== 等级差惩罚表 ======
const levelPenalty: Record<number, { damage: number; expSolo: number }> = {
  [-10]: { damage: 1.0, expSolo: 0.1 },
  [-9]: { damage: 1.0, expSolo: 0.1 },
  [-8]: { damage: 1.0, expSolo: 0.1 },
  [-7]: { damage: 1.0, expSolo: 0.1 },
  [-6]: { damage: 1.0, expSolo: 0.1 },
  [-5]: { damage: 1.0, expSolo: 0.1 },
  [-4]: { damage: 1.0, expSolo: 0.4 },
  [-3]: { damage: 1.0, expSolo: 0.4 },
  [-2]: { damage: 1.0, expSolo: 0.7 },
  [-1]: { damage: 1.0, expSolo: 0.7 },
  [0]: { damage: 1.0, expSolo: 1.0 },
  [+1]: { damage: 1.0, expSolo: 1.0 },
  [+2]: { damage: 0.98, expSolo: 1.0 },
  [+3]: { damage: 0.95, expSolo: 1.0 },
  [+4]: { damage: 0.91, expSolo: 1.0 },
  [+5]: { damage: 0.87, expSolo: 1.0 },
  [+6]: { damage: 0.81, expSolo: 1.0 },
  [+7]: { damage: 0.75, expSolo: 1.0 },
  [+8]: { damage: 0.67, expSolo: 1.0 },
  [+9]: { damage: 0.59, expSolo: 1.0 },
  [+10]: { damage: 0.51, expSolo: 1.0 },
  [+11]: { damage: 0.42, expSolo: 1.0 },
  [+12]: { damage: 0.32, expSolo: 1.0 },
  [+13]: { damage: 0.22, expSolo: 1.0 },
  [+14]: { damage: 0.12, expSolo: 1.0 },
  [+15]: { damage: 0.03, expSolo: 1.0 },
  [+16]: { damage: 0.01, expSolo: 1.0 },
  [+17]: { damage: 0.01, expSolo: 1.0 },
};

function getPenalty(levelDiff: number) {
  const diffs = Object.keys(levelPenalty).map(Number);
  const min = Math.min(...diffs);
  const max = Math.max(...diffs);
  const clamped = Math.max(min, Math.min(max, levelDiff));
  return levelPenalty[clamped];
}

// ====== 读 Monster 数据（只读一次） ======
const monsters = monstersJson as Monster[];

type Monster = {
  id: number;
  name: { en: string };
  event: boolean;
  level: number;
  hp: number;
  experience?: number;
  experienceTable?: number[];
  // area 信息，例如：'normal' = 野外 / 普通地图
  area?: string;
};

export type MonsterScore = {
  id: number;
  name: string;
  monsterLevel: number;
  diff: number;
  hp: number;
  baseExp: number;
  expPerKill: number;
  killsToLevel: number;
  score: number;
  timePerKillSec: number; // 打死一只所需时间
  timeToLevelSec: number; // 从 0 到 100% 升级所需总时间
};

// ====== 计算单个等级的结果（内部函数） ======
function computeScoresForLevel(
  playerLevel: number,
  extraExpMultiplier: number,
  baseDps: number,
  onlyNormal: boolean,
): MonsterScore[] {
  const scored: MonsterScore[] = [];

  for (const m of monsters as Monster[]) {
    if (!m.level || !m.hp) continue;

    // 只计算野外怪物（area === 'normal'）
    if (onlyNormal && m.area !== 'normal') continue;

    if (m.event) continue; // 忽略活动怪物

    const levelDiff = m.level - playerLevel;
    const penalty = getPenalty(levelDiff);
    if (!penalty) continue;

    // 当前等级经验：优先使用 experienceTable
    let baseExp = 0;
    if (m.experienceTable && m.experienceTable.length >= playerLevel) {
      baseExp = m.experienceTable[playerLevel - 1];
    } else if (typeof m.experience === 'number') {
      baseExp = m.experience;
    }
    if (!baseExp) continue;

    // 每只怪实际能拿到的经验（百分比，已经乘上经验药水倍率）
    const expPerKill = baseExp * penalty.expSolo * extraExpMultiplier;

    // 效率评分（单位时间经验的近似）：经验 * 伤害倍率 / HP
    const score = (expPerKill * penalty.damage) / m.hp;

    // 从 0% → 100% 升级需要打多少只
    const killsToLevel = expPerKill > 0 ? Math.ceil(EXP_TO_LEVEL / expPerKill) : Infinity;

    // 时间相关：DPS 受伤害惩罚影响
    const effectiveDps = baseDps * penalty.damage;
    const timePerKillSec = effectiveDps > 0 ? m.hp / effectiveDps : Infinity;
    const timeToLevelSec =
      Number.isFinite(killsToLevel) && killsToLevel !== Infinity
        ? killsToLevel * timePerKillSec
        : Infinity;

    scored.push({
      id: m.id,
      name: m.name?.en ?? 'Unknown',
      monsterLevel: m.level,
      diff: levelDiff,
      hp: m.hp,
      baseExp,
      expPerKill,
      killsToLevel,
      score,
      timePerKillSec,
      timeToLevelSec,
    });
  }

  // 按 score 从高到低排序
  return scored.sort((a, b) => b.score - a.score);
}

// ====== 导出的总函数：传入区间 & 参数，返回 JSON 结构 ======

type ComputeBestMobsOptions = {
  /** 只计算野外怪物（area === 'normal'） */
  onlyNormal?: boolean;
};

export function computeBestMobs(
  startLevel: number,
  endLevel: number,
  extraExpMultiplier: number,
  baseDps: number,
  topN = 3,
  options?: ComputeBestMobsOptions,
): Record<number, MonsterScore[]> {
  const output: Record<number, MonsterScore[]> = {};
  const onlyNormal = options?.onlyNormal ?? true;

  for (let lvl = startLevel; lvl <= endLevel; lvl++) {
    const ranked = computeScoresForLevel(lvl, extraExpMultiplier, baseDps, onlyNormal);
    output[lvl] = ranked.slice(0, topN);
  }

  return output;
}
