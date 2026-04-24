'use client';
import { useState, useEffect, useCallback } from 'react';

const PRO_KEY      = 'css4jobs_pro_v2';
const FREE_USG_KEY = 'css4jobs_free_usage';
const FREE_LIMIT   = 3;

interface ProData {
  email:        string;
  key:          string;
  limit:        number;   // CVs per month
  exp:          string;   // ISO expiry
  usedMonth:    number;   // CVs used this month
  resetMonth:   string;   // 'YYYY-MM'
}

function thisMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function usePro() {
  const [proData,  setProData]  = useState<ProData | null>(null);
  const [freeUsed, setFreeUsed] = useState(0);
  const [ready,    setReady]    = useState(false);

  useEffect(() => {
    // ── Load Pro data ──────────────────────────────────────────────────────
    const raw = localStorage.getItem(PRO_KEY);
    if (raw) {
      try {
        const d: ProData = JSON.parse(raw);
        // Expired key → clear
        if (new Date(d.exp) < new Date()) {
          localStorage.removeItem(PRO_KEY);
        } else {
          // Reset monthly counter on new month
          if (d.resetMonth !== thisMonth()) {
            d.usedMonth  = 0;
            d.resetMonth = thisMonth();
            localStorage.setItem(PRO_KEY, JSON.stringify(d));
          }
          setProData(d);
        }
      } catch {
        localStorage.removeItem(PRO_KEY);
      }
    }

    // ── Load free usage ───────────────────────────────────────────────────
    const fu = localStorage.getItem(FREE_USG_KEY);
    if (fu) {
      try {
        const u: { month: string; used: number } = JSON.parse(fu);
        setFreeUsed(u.month === thisMonth() ? u.used : 0);
      } catch { /* ignore */ }
    }

    setReady(true);
  }, []);

  const isPro   = proData !== null;
  const cvLimit = isPro ? proData!.limit : FREE_LIMIT;
  const cvUsed  = isPro ? proData!.usedMonth : freeUsed;
  const canGenerate = cvUsed < cvLimit;

  // ── Record one CV generation ─────────────────────────────────────────────
  const recordCVUse = useCallback(() => {
    if (isPro && proData) {
      const updated = { ...proData, usedMonth: proData.usedMonth + 1 };
      setProData(updated);
      localStorage.setItem(PRO_KEY, JSON.stringify(updated));
    } else {
      const n = freeUsed + 1;
      setFreeUsed(n);
      localStorage.setItem(FREE_USG_KEY, JSON.stringify({ month: thisMonth(), used: n }));
    }
  }, [isPro, proData, freeUsed]);

  // ── Activate Pro via email + key ─────────────────────────────────────────
  const activatePro = useCallback(
    async (email: string, key: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const res  = await fetch('/api/verify-key', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email, key }),
        });
        const data = await res.json();
        if (!data.valid) return { success: false, error: data.error };

        const d: ProData = {
          email, key,
          limit:      data.limit,
          exp:        data.exp,
          usedMonth:  0,
          resetMonth: thisMonth(),
        };
        setProData(d);
        localStorage.setItem(PRO_KEY, JSON.stringify(d));
        return { success: true };
      } catch {
        return { success: false, error: 'Error de conexión' };
      }
    }, []
  );

  const deactivatePro = useCallback(() => {
    setProData(null);
    localStorage.removeItem(PRO_KEY);
  }, []);

  // Legacy shim (no longer used — kept for safety)
  const unlockPro = useCallback((_code: string): boolean => false, []);

  return {
    isPro, ready, proData,
    cvLimit, cvUsed, canGenerate,
    recordCVUse, activatePro, deactivatePro,
    unlockPro,
  };
}
