import { useEffect, useState } from 'react';
import { DEFAULT_PREFERENCES, type Category, type Preferences } from '@whatnext/core';
import { indexedDbStorage } from '../lib/storage/indexedDbAdapter';
import { SettingsPanel } from '../components/SettingsPanel';

export function Options() {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    indexedDbStorage.getPreferences().then((p) => {
      setPrefs(p);
      setLoading(false);
    });
  }, []);

  const update = async (partial: Partial<Preferences>) => {
    const next = { ...prefs, ...partial };
    await indexedDbStorage.savePreferences(next);
    setPrefs(next);
  };

  const toggleCategory = async (category: Category, enabled: boolean) => {
    const disabled = new Set(prefs.disabledCategories);
    if (enabled) disabled.delete(category);
    else disabled.add(category);
    await update({ disabledCategories: [...disabled] });
  };

  const clearAll = async () => {
    await indexedDbStorage.clearAll();
    const resetPrefs = {
      ...DEFAULT_PREFERENCES,
      onboardingCompleted: false,
    };
    await indexedDbStorage.savePreferences(resetPrefs);
    setPrefs(resetPrefs);

    if (typeof chrome !== 'undefined' && chrome.storage) {
      if (chrome.storage.session) {
        await chrome.storage.session.clear().catch(() => {});
      }
      if (chrome.storage.local) {
        await chrome.storage.local.clear().catch(() => {});
      }
      chrome.runtime.sendMessage({ type: 'DATA_CLEARED' }).catch(() => {});
    }
  };

  if (loading) {
    return <div className="p-8 text-muted text-sm">Loading settings…</div>;
  }

  return (
    <div className="min-h-screen px-6 py-8 md:px-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-2xl font-bold mb-1">WhatNext? Settings</h1>
        <p className="text-sm text-muted mb-6">
          Everything here is stored locally in this browser. Nothing is uploaded unless you explicitly enable MCP
          sync below.
        </p>
        <SettingsPanel prefs={prefs} onUpdate={update} onToggleCategory={toggleCategory} onClearAll={clearAll} />
      </div>
    </div>
  );
}
