"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  FeatureFlag,
  FeatureFlagConfig,
  readStoredFeatureFlags,
  saveFeatureFlags,
  isFeatureEnabled,
  enableFeatureFlag,
  disableFeatureFlag,
  toggleFeatureFlag,
  resetFeatureFlags,
} from '@/lib/featureFlags';

interface FeatureFlagContextValue {
  flags: FeatureFlagConfig;
  isEnabled: (flag: FeatureFlag) => boolean;
  enableFlag: (flag: FeatureFlag) => void;
  disableFlag: (flag: FeatureFlag) => void;
  toggleFlag: (flag: FeatureFlag) => void;
  resetFlags: () => void;
  updateFlags: (flags: FeatureFlagConfig) => void;
}

const FeatureFlagContext = createContext<FeatureFlagContextValue | null>(null);

export function FeatureFlagProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlagConfig>(readStoredFeatureFlags);

  // Sync with localStorage changes (e.g., from other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'notenest-feature-flags' && e.newValue) {
        try {
          const newFlags = JSON.parse(e.newValue);
          setFlags(newFlags);
        } catch {
          // ignore invalid data
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateFlags = (newFlags: FeatureFlagConfig) => {
    setFlags(newFlags);
    saveFeatureFlags(newFlags);
  };

  const enableFlag = (flag: FeatureFlag) => {
    const newFlags = { ...flags, [flag]: true };
    updateFlags(newFlags);
  };

  const disableFlag = (flag: FeatureFlag) => {
    const newFlags = { ...flags, [flag]: false };
    updateFlags(newFlags);
  };

  const toggleFlag = (flag: FeatureFlag) => {
    const newFlags = { ...flags, [flag]: !flags[flag] };
    updateFlags(newFlags);
  };

  const resetFlags = () => {
    const defaultFlags = readStoredFeatureFlags();
    setFlags(defaultFlags);
    resetFeatureFlags();
  };

  const value: FeatureFlagContextValue = {
    flags,
    isEnabled: (flag: FeatureFlag) => isFeatureEnabled(flag, flags),
    enableFlag,
    disableFlag,
    toggleFlag,
    resetFlags,
    updateFlags,
  };

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlags(): FeatureFlagContextValue {
  const ctx = useContext(FeatureFlagContext);
  if (!ctx) {
    throw new Error('useFeatureFlags must be used within FeatureFlagProvider');
  }
  return ctx;
}
