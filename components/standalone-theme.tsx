'use client';

import { Home, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type StandaloneMode = 'archive' | 'night';

type StandaloneThemeContextValue = {
  mode: StandaloneMode;
  setMode: (mode: StandaloneMode) => void;
  toggleMode: () => void;
};

const StandaloneThemeContext = createContext<StandaloneThemeContextValue | null>(null);
const STORAGE_KEY = 'hoshikuzu-standalone-mode';
const DEFAULT_MODE: StandaloneMode = 'night';

export function StandaloneThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<StandaloneMode>(DEFAULT_MODE);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'archive' || stored === 'night') {
      const frame = window.requestAnimationFrame(() => setMode(stored));
      return () => window.cancelAnimationFrame(frame);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.atlasMode = mode;
    window.localStorage.setItem(STORAGE_KEY, mode);
    return () => {
      delete document.documentElement.dataset.atlasMode;
    };
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      toggleMode: () => setMode((current) => (current === 'archive' ? 'night' : 'archive')),
    }),
    [mode],
  );

  return (
    <StandaloneThemeContext.Provider value={value}>{children}</StandaloneThemeContext.Provider>
  );
}

export function useStandaloneTheme() {
  const context = useContext(StandaloneThemeContext);
  if (!context) {
    throw new Error('useStandaloneTheme must be used within StandaloneThemeProvider');
  }
  return context;
}

export function StandaloneFloatingActions({ showHome = true }: { showHome?: boolean }) {
  const { mode, toggleMode } = useStandaloneTheme();
  const modeLabel = mode === 'archive' ? 'Archive Sheet' : 'Night Atlas';
  const floatingStyle =
    mode === 'archive'
      ? {
          background: 'rgba(255, 255, 252, 0.82)',
          borderColor: 'rgba(36, 48, 64, 0.18)',
          color: '#172033',
        }
      : {
          background: 'rgba(5, 7, 13, 0.8)',
          borderColor: 'rgba(255, 255, 255, 0.14)',
          color: '#f8fafc',
        };

  return (
    <div className="fixed bottom-[max(16px,env(safe-area-inset-bottom))] right-[max(16px,env(safe-area-inset-right))] z-[60] flex items-center justify-end gap-2 md:bottom-6 md:right-6">
      <button
        type="button"
        onClick={toggleMode}
        className="standalone-floating-action group inline-flex h-8 w-8 items-center justify-start gap-2 overflow-hidden border px-2 text-[0.625rem] font-semibold uppercase tracking-[0.16em] shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-[width,border-color,background-color] duration-200 ease-out hover:w-[8.9rem] focus-visible:w-[8.9rem]"
        style={floatingStyle}
        aria-label={`Switch to ${mode === 'archive' ? 'night atlas' : 'archive sheet'} mode`}
        title={modeLabel}
      >
        {mode === 'archive' ? (
          <Sun className="size-3.5 shrink-0" />
        ) : (
          <Moon className="size-3.5 shrink-0" />
        )}
        <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-[max-width,opacity] duration-200 ease-out group-hover:max-w-28 group-hover:opacity-100 group-focus-visible:max-w-28 group-focus-visible:opacity-100">
          {modeLabel}
        </span>
      </button>

      {showHome ? (
        <Link
          href="/"
          className="standalone-floating-action group inline-flex h-8 w-8 items-center justify-start gap-2 overflow-hidden border px-2 text-[0.625rem] font-semibold uppercase tracking-[0.16em] shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-[width,border-color,background-color] duration-200 ease-out hover:w-[5.6rem] focus-visible:w-[5.6rem]"
          style={floatingStyle}
          aria-label="Go home"
          title="Home"
        >
          <Home className="size-3.5 shrink-0" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-[max-width,opacity] duration-200 ease-out group-hover:max-w-16 group-hover:opacity-100 group-focus-visible:max-w-16 group-focus-visible:opacity-100">
            Home
          </span>
        </Link>
      ) : null}
    </div>
  );
}
