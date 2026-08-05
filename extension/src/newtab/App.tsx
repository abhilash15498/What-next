import { useState } from 'react';
import { Sparkles, Rows3, Heart, History, Share2, BarChart3, Search, Settings } from 'lucide-react';
import { useAppData } from '../lib/AppDataContext';
import { Onboarding } from './Onboarding';
import { TodayTab } from './tabs/TodayTab';
import { FeedTab } from './tabs/FeedTab';
import { SavedTab } from './tabs/SavedTab';
import { HistoryTab } from './tabs/HistoryTab';
import { GraphTab } from './tabs/GraphTab';
import { AnalyticsTab } from './tabs/AnalyticsTab';
import { SearchTab } from './tabs/SearchTab';
import { SettingsTab } from './tabs/SettingsTab';

type TabId = 'today' | 'feed' | 'saved' | 'history' | 'graph' | 'analytics' | 'search' | 'settings';

const TABS: Array<{ id: TabId; label: string; icon: typeof Sparkles }> = [
  { id: 'today', label: 'Today', icon: Sparkles },
  { id: 'feed', label: 'Feed', icon: Rows3 },
  { id: 'saved', label: 'Saved', icon: Heart },
  { id: 'history', label: 'History', icon: History },
  { id: 'graph', label: 'Interest Graph', icon: Share2 },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function App() {
  const [active, setActive] = useState<TabId>('today');
  const { prefs, refresh } = useAppData();

  if (!prefs.onboardingCompleted) {
    return <Onboarding onDone={refresh} />;
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 shrink-0 border-r border-border bg-surface/50 px-3 py-6 flex flex-col">
        <div className="px-3 mb-8">
          <h1 className="font-display text-lg font-bold leading-tight">WhatNext?</h1>
          <p className="text-[11px] text-muted mt-0.5">Stop Scrolling. Start Doing.</p>
        </div>
        <nav className="flex-1 space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={
                active === id
                  ? 'w-full flex items-center gap-2.5 rounded-lg bg-signal/12 px-3 py-2 text-sm font-medium text-signal'
                  : 'w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted hover:text-text hover:bg-surface2 transition-colors'
              }
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>
        <p className="px-3 text-[10px] text-muted/70 font-mono">100% local · no login</p>
      </aside>

      <main className="flex-1 px-8 py-8 overflow-y-auto scrollbar-thin max-h-screen">
        <div className="mx-auto max-w-5xl">
          {active === 'today' && <TodayTab />}
          {active === 'feed' && <FeedTab />}
          {active === 'saved' && <SavedTab />}
          {active === 'history' && <HistoryTab />}
          {active === 'graph' && <GraphTab />}
          {active === 'analytics' && <AnalyticsTab />}
          {active === 'search' && <SearchTab />}
          {active === 'settings' && <SettingsTab />}
        </div>
      </main>
    </div>
  );
}
