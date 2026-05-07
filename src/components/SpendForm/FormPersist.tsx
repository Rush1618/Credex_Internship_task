'use client';

import { useEffect } from 'react';
import { AuditInput } from '@/types';

const STORAGE_KEY = 'spendlens_audit_draft';

export function useFormPersist(
  value: AuditInput,
  setValue: (v: AuditInput) => void
) {
  // Load on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as AuditInput;
        setValue(parsed);
      }
    } catch {
      // ignore malformed data
    }
  }, [setValue]);

  // Save on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      // ignore quota errors
    }
  }, [value]);
}

export function clearFormDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
