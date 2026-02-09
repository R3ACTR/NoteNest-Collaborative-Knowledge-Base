"use client";

import { useCallback, useEffect, useState } from 'react';
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

/**
 * React hook for managing feature flags
 * Provides reactive access to feature flags with automatic localStorage sync
 */
export function useFeatureFlags() {
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

  const updateFlags = useCallback((newFlags: FeatureFlagConfig) => {
    setFlags(newFlags);
    saveFeatureFlags(newFlags);
  }, []);

  const enableFlag = useCallback((flag: FeatureFlag) => {
    const newFlags = { ...flags, [flag]: true };
    updateFlags(newFlags);
  }, [flags, updateFlags]);

  const disableFlag = useCallback((flag: FeatureFlag) => {
    const newFlags = { ...flags, [flag]: false };
    updateFlags(newFlags);
  }, [flags, updateFlags]);

  const toggleFlag = useCallback((flag: FeatureFlag) => {
    const newFlags = { ...flags, [flag]: !flags[flag] };
    updateFlags(newFlags);
  }, [flags, updateFlags]);

  const resetFlags = useCallback(() => {
    const defaultFlags = readStoredFeatureFlags();
    setFlags(defaultFlags);
    resetFeatureFlags();
  }, []);

  return {
    flags,
    isEnabled: (flag: FeatureFlag) => isFeatureEnabled(flag, flags),
    enableFlag,
    disableFlag,
    toggleFlag,
    resetFlags,
    updateFlags,
  };
}

/**
 * Hook for checking if a specific feature flag is enabled
 * Useful for conditional rendering and feature gating
 */
export function useFeatureFlag(flag: FeatureFlag): boolean {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(flag);
}
