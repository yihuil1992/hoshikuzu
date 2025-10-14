'use client';
import * as React from 'react';

type Props = {
  /** 0-100 */
  value: number;
  size?: number;
  thickness?: number;
  label?: React.ReactNode;
  colorClass?: string; // Tailwind 类，默认 stroke-primary
  bgClass?: string; // Tailwind 类，默认 stroke-muted
  transitionMs?: number;
};

export default function CountdownRing({
  value,
  size = 112,
  thickness = 10,
  label,
  colorClass = 'stroke-primary',
  bgClass = 'stroke-muted',
  transitionMs = 250,
}: Props) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const dash = (Math.max(0, Math.min(100, value)) / 100) * c;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className={bgClass}
          strokeWidth={thickness}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className={colorClass}
          strokeWidth={thickness}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${c - dash}`}
          style={{ transition: `stroke-dasharray ${transitionMs}ms ease` }}
        />
      </svg>
      {label && (
        <div className="absolute inset-0 grid place-items-center text-center pointer-events-none">
          {label}
        </div>
      )}
    </div>
  );
}
