/**
 * Centralized feature flag configuration for NoteNest.
 * Frontend-only feature flags for experimental and optional features.
 * Flags can be enabled/disabled globally and are persisted in localStorage.
 */

export type FeatureFlag = string;

export interface FeatureFlagConfig {
  [key: FeatureFlag]: boolean;
}

// Default feature flags - these can be extended as new features are added
export const DEFAULT_FEATURE_FLAGS: FeatureFlagConfig = {
  // Experimental features
  'advanced-search': false,
  'ai-suggestions': false,
  'real-time-collaboration': false,
  'dark-mode': false,
  'keyboard-shortcuts': true, // Enabled by default
  'command-palette': true, // Enabled by default

  // UI improvements
  'improved-sidebar': false,
  'enhanced-editor': false,

  // Admin features
  'bulk-actions': false,
  'advanced-analytics': false,
};

const STORAGE_KEY_FEATURE_FLAGS = 'notenest-feature-flags';

/**
 * Read feature flags from localStorage, falling back to defaults
 */
export function readStoredFeatureFlags(): FeatureFlagConfig {
  if (typeof window === 'undefined') return { ...DEFAULT_FEATURE_FLAGS };

  try {
    const stored = localStorage.getItem(STORAGE_KEY_FEATURE_FLAGS);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle new flags
      return { ...DEFAULT_FEATURE_FLAGS, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to read feature flags from localStorage:', error);
  }

  return { ...DEFAULT_FEATURE_FLAGS };
}

/**
 * Save feature flags to localStorage
 */
export function saveFeatureFlags(flags: FeatureFlagConfig): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY_FEATURE_FLAGS, JSON.stringify(flags));
  } catch (error) {
    console.warn('Failed to save feature flags to localStorage:', error);
  }
}

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag, flags?: FeatureFlagConfig): boolean {
  const currentFlags = flags || readStoredFeatureFlags();
  return currentFlags[flag] ?? false;
}

/**
 * Enable a feature flag
 */
export function enableFeatureFlag(flag: FeatureFlag): void {
  const flags = readStoredFeatureFlags();
  flags[flag] = true;
  saveFeatureFlags(flags);
}

/**
 * Disable a feature flag
 */
export function disableFeatureFlag(flag: FeatureFlag): void {
  const flags = readStoredFeatureFlags();
  flags[flag] = false;
  saveFeatureFlags(flags);
}

/**
 * Toggle a feature flag
 */
export function toggleFeatureFlag(flag: FeatureFlag): void {
  const flags = readStoredFeatureFlags();
  flags[flag] = !flags[flag];
  saveFeatureFlags(flags);
}

/**
 * Reset feature flags to defaults
 */
export function resetFeatureFlags(): void {
  saveFeatureFlags({ ...DEFAULT_FEATURE_FLAGS });
}
