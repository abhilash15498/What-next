import { useState } from 'react';
import { Trash2, ShieldCheck, KeyRound, Plus, X, ExternalLink, CheckCircle2, Circle } from 'lucide-react';
import type { Category, Preferences } from '@whatnext/core';

const ALL_CATEGORIES: Category[] = [
  'movie',
  'book',
  'github',
  'learning',
  'coding_project',
  'fitness',
  'career',
  'tool',
  'news',
  'travel',
  'finance',
];

const LABELS: Record<Category, string> = {
  movie: 'Movies & TV',
  book: 'Books',
  github: 'GitHub repos',
  learning: 'Courses & learning',
  coding_project: 'Coding projects',
  fitness: 'Fitness',
  career: 'Career',
  tool: 'Tools',
  news: 'News',
  travel: 'Trip ideas & travel',
  finance: 'Stock market & finance',
};

interface Props {
  prefs: Preferences;
  onUpdate: (partial: Partial<Preferences>) => Promise<void>;
  onToggleCategory: (category: Category, enabled: boolean) => Promise<void>;
  onClearAll: () => Promise<void>;
}

// ── Reusable API key row ───────────────────────────────────────────────────────

interface ApiKeyRowProps {
  label: string;
  value: string;
  placeholder: string;
  helpUrl: string;
  helpLabel: string;
  onChange: (v: string) => void;
  onSave: () => void;
}

function ApiKeyRow({ label, value, placeholder, helpUrl, helpLabel, onChange, onSave }: ApiKeyRowProps) {
  const isSet = value.trim().length > 0;
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium text-text flex items-center gap-1.5">
          {isSet ? (
            <CheckCircle2 size={12} className="text-success" />
          ) : (
            <Circle size={12} className="text-muted" />
          )}
          {label}
        </label>
        <a
          href={helpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-[11px] text-signal hover:underline"
        >
          Get key <ExternalLink size={10} />
        </a>
      </div>
      <div className="flex gap-2">
        <input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-border bg-surface2 px-3 py-1.5 text-sm font-mono outline-none focus:border-signal"
        />
        <button
          onClick={onSave}
          className="rounded-lg border border-border bg-surface2 px-3 py-1.5 text-sm text-muted hover:text-text transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function SettingsPanel({ prefs, onUpdate, onToggleCategory, onClearAll }: Props) {
  const [newDomain, setNewDomain] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  // Draft states for all API keys
  const [tmdbDraft, setTmdbDraft] = useState(prefs.tmdbApiKey ?? '');
  const [booksDraft, setBooksDraft] = useState(prefs.googleBooksApiKey ?? '');
  const [githubDraft, setGithubDraft] = useState(prefs.githubToken ?? '');
  const [newsDraft, setNewsDraft] = useState(prefs.newsApiKey ?? '');
  const [groqDraft, setGroqDraft] = useState(prefs.groqApiKey ?? '');
  const [anthropicDraft, setAnthropicDraft] = useState(prefs.anthropicApiKey ?? '');

  return (
    <div className="space-y-6 max-w-2xl">

      {/* ── Categories ──────────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-border bg-surface p-4">
        <h3 className="font-display text-sm font-semibold mb-3">Categories</h3>
        <div className="grid grid-cols-2 gap-2">
          {ALL_CATEGORIES.map((cat) => {
            const enabled = !prefs.disabledCategories.includes(cat);
            return (
              <label
                key={cat}
                className="flex items-center gap-2 rounded-lg border border-border bg-surface2 px-3 py-2 text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => onToggleCategory(cat, e.target.checked)}
                  className="accent-signal"
                />
                {LABELS[cat]}
              </label>
            );
          })}
        </div>
      </section>

      {/* ── Time budget ─────────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-border bg-surface p-4">
        <h3 className="font-display text-sm font-semibold mb-3">Time budget</h3>
        <label className="block text-xs text-muted mb-2">
          Minutes available per day: <span className="font-mono text-text">{prefs.availableMinutesPerDay}</span>
        </label>
        <input
          type="range"
          min={15}
          max={480}
          step={15}
          value={prefs.availableMinutesPerDay}
          onChange={(e) => onUpdate({ availableMinutesPerDay: Number(e.target.value) })}
          className="w-full accent-signal"
        />
      </section>

      {/* ── Live data API keys ───────────────────────────────────────────────── */}
      <section className="rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center gap-2 mb-1">
          <KeyRound size={16} className="text-signal" />
          <h3 className="font-display text-sm font-semibold">Live data API keys (optional, BYOK)</h3>
        </div>
        <p className="text-xs text-muted mb-4">
          Add your own API keys to get live, up-to-date recommendations instead of the built-in curated lists.
          All keys are stored <strong>only</strong> in this browser's IndexedDB — never uploaded anywhere.
        </p>

        <ApiKeyRow
          label="TMDB — Movies & TV"
          value={tmdbDraft}
          placeholder="eyJhbGciO…"
          helpUrl="https://www.themoviedb.org/settings/api"
          helpLabel="Get TMDB key"
          onChange={setTmdbDraft}
          onSave={() => onUpdate({ tmdbApiKey: tmdbDraft })}
        />
        <ApiKeyRow
          label="Google Books — Books"
          value={booksDraft}
          placeholder="AIza…"
          helpUrl="https://console.cloud.google.com/apis/library/books.googleapis.com"
          helpLabel="Get Google Books key"
          onChange={setBooksDraft}
          onSave={() => onUpdate({ googleBooksApiKey: booksDraft })}
        />
        <ApiKeyRow
          label="GitHub Token — GitHub repos"
          value={githubDraft}
          placeholder="ghp_…"
          helpUrl="https://github.com/settings/tokens/new?scopes=public_repo"
          helpLabel="Get GitHub token"
          onChange={setGithubDraft}
          onSave={() => onUpdate({ githubToken: githubDraft })}
        />
        <ApiKeyRow
          label="NewsAPI — News"
          value={newsDraft}
          placeholder="abc123…"
          helpUrl="https://newsapi.org/register"
          helpLabel="Get NewsAPI key"
          onChange={setNewsDraft}
          onSave={() => onUpdate({ newsApiKey: newsDraft })}
        />
      </section>

      {/* ── AI reasoning keys ────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center gap-2 mb-1">
          <KeyRound size={16} className="text-signal" />
          <h3 className="font-display text-sm font-semibold">AI-powered reasoning (optional, BYOK)</h3>
        </div>
        <p className="text-xs text-muted mb-4">
          Add an LLM API key to get genuinely personalised "Why Now?" and reasoning explanations on every recommendation
          card — not just templates. Calls go directly from your browser to the LLM provider. WhatNext never sees your key.
        </p>

        <ApiKeyRow
          label="Groq — llama-3.3-70b (recommended, free tier)"
          value={groqDraft}
          placeholder="gsk_…"
          helpUrl="https://console.groq.com/keys"
          helpLabel="Get Groq key"
          onChange={setGroqDraft}
          onSave={() => onUpdate({ groqApiKey: groqDraft })}
        />
        <ApiKeyRow
          label="Anthropic Claude (optional, alternative)"
          value={anthropicDraft}
          placeholder="sk-ant-…"
          helpUrl="https://console.anthropic.com/account/keys"
          helpLabel="Get Anthropic key"
          onChange={setAnthropicDraft}
          onSave={() => onUpdate({ anthropicApiKey: anthropicDraft })}
        />
      </section>

      {/* ── Privacy — domain blocklist ───────────────────────────────────────── */}
      <section className="rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={16} className="text-success" />
          <h3 className="font-display text-sm font-semibold">Privacy — domain blocklist</h3>
        </div>
        <p className="text-xs text-muted mb-3">
          Pages on these domains (or containing these substrings) are never read for signals — banking,
          government, payment, and auth pages are blocked by default.
        </p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {prefs.domainBlocklist.map((domain) => (
            <span
              key={domain}
              className="inline-flex items-center gap-1 rounded-full bg-surface2 border border-border px-2.5 py-1 font-mono text-[11px] text-muted"
            >
              {domain}
              <button
                onClick={() => onUpdate({ domainBlocklist: prefs.domainBlocklist.filter((d) => d !== domain) })}
                className="hover:text-danger"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="e.g. myworkportal.com"
            className="flex-1 rounded-lg border border-border bg-surface2 px-3 py-1.5 text-sm outline-none focus:border-signal"
          />
          <button
            onClick={() => {
              if (!newDomain.trim()) return;
              onUpdate({ domainBlocklist: [...prefs.domainBlocklist, newDomain.trim().toLowerCase()] });
              setNewDomain('');
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface2 px-3 py-1.5 text-sm text-muted hover:text-text"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </section>

      {/* ── MCP sync ─────────────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-border bg-surface p-4">
        <h3 className="font-display text-sm font-semibold mb-3">MCP sync (opt-in, off by default)</h3>
        <p className="text-xs text-muted mb-3">
          When enabled, a snapshot of your interest profile, saved recommendations, and preferences is sent to a
          local MCP server (default <span className="font-mono">http://localhost:8787</span>) so any MCP-compatible
          AI client on your machine can query your context. Nothing leaves your device.
        </p>
        <label className="flex items-center gap-2 text-sm mb-3">
          <input
            type="checkbox"
            checked={prefs.mcpSyncEnabled}
            onChange={(e) => onUpdate({ mcpSyncEnabled: e.target.checked })}
            className="accent-signal"
          />
          Enable local MCP sync
        </label>
        {prefs.mcpSyncEnabled && (
          <input
            value={prefs.mcpSyncUrl}
            onChange={(e) => onUpdate({ mcpSyncUrl: e.target.value })}
            className="w-full rounded-lg border border-border bg-surface2 px-3 py-1.5 text-sm font-mono outline-none focus:border-signal"
          />
        )}
      </section>

      {/* ── Danger zone ──────────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-danger/30 bg-danger/5 p-4">
        <h3 className="font-display text-sm font-semibold mb-2 text-danger">Danger zone</h3>
        <p className="text-xs text-muted mb-3">
          Permanently deletes your interest profile, recommendation history, feedback, and saved items from this
          browser. This cannot be undone.
        </p>
        {!confirmClear ? (
          <button
            onClick={() => setConfirmClear(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-danger/40 bg-danger/10 px-3 py-1.5 text-sm text-danger hover:bg-danger/20"
          >
            <Trash2 size={14} /> Clear all local data
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                onClearAll();
                setConfirmClear(false);
              }}
              className="rounded-lg bg-danger px-3 py-1.5 text-sm font-medium text-bg"
            >
              Yes, delete everything
            </button>
            <button
              onClick={() => setConfirmClear(false)}
              className="rounded-lg border border-border bg-surface2 px-3 py-1.5 text-sm text-muted"
            >
              Cancel
            </button>
          </div>
        )}
      </section>

    </div>
  );
}
