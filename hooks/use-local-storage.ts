// use-local-storage.ts
'use client';
import { useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  useEffect(() => {
    const raw = localStorage.getItem(key);
    if (raw != null) setValue(JSON.parse(raw));
  }, [key]);
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue] as const;
}
