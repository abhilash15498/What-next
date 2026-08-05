import { useState } from 'react';
import { applySignals, makeId, type Signal } from '@whatnext/core';
import { indexedDbStorage } from '../lib/storage/indexedDbAdapter';

const STARTER_INTERESTS = [
  'ai',
  'programming',
  'cooking',
  'food',
  'anime',
  'bollywood',
  'travel',
  'stock_market',
  'finance',
  'football',
  'fitness',
  'entrepreneurship',
  'movies',
  'books',
  'career',
  'design',
  'gaming',
  'productivity',
];

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const toggle = (tag: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const finish = async () => {
    setSaving(true);
    const signal: Signal = {
      id: makeId('sig'),
      source: 'manual',
      tags: [...selected].map((tag) => ({ tag, weight: 0.9 })),
      timestamp: Date.now(),
      label: 'Onboarding selection',
    };
    const profile = await indexedDbStorage.getInterestProfile();
    await indexedDbStorage.saveInterestProfile(applySignals(profile, [signal]));
    const prefs = await indexedDbStorage.getPreferences();
    await indexedDbStorage.savePreferences({ ...prefs, onboardingCompleted: true });
    setSaving(false);
    onDone();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-xl w-full">
        <h1 className="font-display text-3xl font-bold mb-2">
          Stop Scrolling. <span className="text-signal">Start Doing.</span>
        </h1>
        <p className="text-muted text-sm mb-6">
          Pick a few things you're into right now — this gives WhatNext a starting point. It'll keep learning and
          adjusting from here on its own, and everything stays on this device.
        </p>
        <div className="flex flex-wrap gap-2 mb-8">
          {STARTER_INTERESTS.map((tag) => {
            const active = selected.has(tag);
            return (
              <button
                key={tag}
                onClick={() => toggle(tag)}
                className={
                  active
                    ? 'rounded-full border border-signal bg-signal/15 px-3.5 py-1.5 text-sm text-signal transition-colors'
                    : 'rounded-full border border-border bg-surface2 px-3.5 py-1.5 text-sm text-muted hover:text-text transition-colors'
                }
              >
                {tag.replace(/_/g, ' ')}
              </button>
            );
          })}
        </div>
        <button
          onClick={finish}
          disabled={saving || selected.size === 0}
          className="w-full rounded-xl bg-signal py-3 font-display font-medium text-bg disabled:opacity-50"
        >
          {saving ? 'Setting up…' : `Continue with ${selected.size} interest${selected.size === 1 ? '' : 's'}`}
        </button>
      </div>
    </div>
  );
}
