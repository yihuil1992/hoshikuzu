// use-countdown.ts
'use client';
import { useEffect, useRef, useState } from 'react';

export type NextStartFn = (prevCycleStart: number) => number;

type SetMaxOptions = { clampSeconds?: boolean; bumpVersion?: boolean };

export function useCountdown({
  initial,
  running = false,
  stepMs = 1000,
  nextStart = () => initial,
}: {
  initial: number;
  running?: boolean;
  stepMs?: number;
  nextStart?: NextStartFn;
}) {
  const [seconds, setSeconds] = useState(initial);
  const [isRunning, setIsRunning] = useState(running);
  const [cycleStart, setCycleStart] = useState(initial);
  const [cycleVersion, setCycleVersion] = useState(0);

  const secondsRef = useRef(initial);
  const cycleStartRef = useRef(initial);
  const nextStartRef = useRef<NextStartFn>(nextStart);

  useEffect(() => {
    nextStartRef.current = nextStart;
  }, [nextStart]);

  // ✅ 关键修复：依赖 isRunning + stepMs，启动/停止 interval
  useEffect(() => {
    if (!isRunning) return;

    const t = setInterval(() => {
      const cur = secondsRef.current;

      if (cur <= 0) {
        const prev = cycleStartRef.current;
        const ns = nextStartRef.current(prev);

        cycleStartRef.current = ns;
        secondsRef.current = ns;

        setCycleStart(ns);
        setCycleVersion((v) => v + 1);
        setSeconds(ns);
      } else {
        const next = cur - 1;
        secondsRef.current = next;
        setSeconds(next);
      }
    }, stepMs);

    return () => clearInterval(t);
  }, [isRunning, stepMs]); // ← 这里必须包含 isRunning

  const start = () => setIsRunning(true);
  const stop = () => setIsRunning(false);
  const toggle = () => setIsRunning((v) => !v);

  const reset = (to = initial) => {
    cycleStartRef.current = to;
    secondsRef.current = to;
    setCycleStart(to);
    setSeconds(to);
    setCycleVersion((v) => v + 1);
    setIsRunning(true);
  };

  /** 不重置倒计时，仅切换当前这一轮的最大秒数 */
  const setMax = (to: number, opts: SetMaxOptions = {}) => {
    const { clampSeconds = true, bumpVersion = true } = opts;

    // 更新“这一轮起点”的 ref/state（影响百分比与下一轮起点计算）
    cycleStartRef.current = to;
    setCycleStart(to);

    // 可选：如果当前剩余秒数比新上限大，夹一下
    if (clampSeconds && secondsRef.current > to) {
      secondsRef.current = to;
      setSeconds(to);
    }

    // 可选：为了让某些受控组件(如 Switch)可靠刷新，顺带 bump 一下版本
    if (bumpVersion) {
      setCycleVersion((v) => v + 1);
    }
  };

  const inc = (max?: number) => {
    const next = Math.min(
      (secondsRef.current ?? seconds) + 1,
      typeof max === 'number' ? max : Number.POSITIVE_INFINITY,
    );
    secondsRef.current = next;
    setSeconds(next);
  };

  const dec = () => {
    const next = Math.max((secondsRef.current ?? seconds) - 1, 0);
    secondsRef.current = next;
    setSeconds(next);
  };

  return {
    seconds,
    isRunning,
    start,
    stop,
    toggle,
    reset,
    inc,
    dec,
    setSeconds,
    cycleStart, // 30 / 32 / 60（响应式）
    cycleVersion, // 切轮递增，可用作 key
    setMax, // ← 暴露出去
  };
}
