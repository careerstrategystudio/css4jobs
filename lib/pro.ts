'use client';
import { useState, useEffect } from 'react';

const PRO_KEY = 'css4jobs_pro';

export function usePro() {
  const [isPro, setIsPro] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIsPro(localStorage.getItem(PRO_KEY) === 'true');
    setReady(true);
  }, []);

  const unlockPro = (code: string): boolean => {
    const expected = process.env.NEXT_PUBLIC_PRO_PASSWORD ?? 'pro2025';
    if (code.trim().toLowerCase() === expected.toLowerCase()) {
      localStorage.setItem(PRO_KEY, 'true');
      setIsPro(true);
      return true;
    }
    return false;
  };

  return { isPro, ready, unlockPro };
}
