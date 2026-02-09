"use client";

import React from 'react';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

/**
 * Example component demonstrating how to use feature flags
 * This component shows different UI based on feature flag states
 */
export default function FeatureFlagExample() {
  const { isEnabled, toggleFlag } = useFeatureFlags();

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Feature Flag Demo</h3>

      <div className="space-y-3">
        {/* Keyboard Shortcuts Feature */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Keyboard Shortcuts</span>
            <p className="text-sm text-gray-600">Enable/disable keyboard shortcuts</p>
          </div>
          <button
            onClick={() => toggleFlag('keyboard-shortcuts')}
            className={`px-3 py-1 rounded text-sm ${
              isEnabled('keyboard-shortcuts')
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {isEnabled('keyboard-shortcuts') ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {/* Command Palette Feature */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Command Palette</span>
            <p className="text-sm text-gray-600">Enable/disable command palette (Cmd+K)</p>
          </div>
          <button
            onClick={() => toggleFlag('command-palette')}
            className={`px-3 py-1 rounded text-sm ${
              isEnabled('command-palette')
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {isEnabled('command-palette') ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {/* Advanced Search Feature */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Advanced Search</span>
            <p className="text-sm text-gray-600">Experimental advanced search features</p>
          </div>
          <button
            onClick={() => toggleFlag('advanced-search')}
            className={`px-3 py-1 rounded text-sm ${
              isEnabled('advanced-search')
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {isEnabled('advanced-search') ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {/* AI Suggestions Feature */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">AI Suggestions</span>
            <p className="text-sm text-gray-600">AI-powered content suggestions</p>
          </div>
          <button
            onClick={() => toggleFlag('ai-suggestions')}
            className={`px-3 py-1 rounded text-sm ${
              isEnabled('ai-suggestions')
                ? 'bg-purple-100 text-purple-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {isEnabled('ai-suggestions') ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {/* Conditional Rendering Example */}
        {isEnabled('advanced-search') && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              🎉 Advanced search is enabled! This content only shows when the feature flag is active.
            </p>
          </div>
        )}

        {isEnabled('ai-suggestions') && (
          <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded">
            <p className="text-sm text-purple-800">
              🤖 AI suggestions are enabled! AI features would be available here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
