import {
  DEFAULT_PREFERENCES,
  applySignals,
  buildDailyDigest,
  buildSignalFromPageVisit,
  buildSignalFromSearch,
  decayProfile,
  generateRecommendations,
  recordFeedback,
  todayKey,
  type EngineResult,
} from '@whatnext/core';
import { indexedDbStorage } from '../lib/storage/indexedDbAdapter';
import { syncToMcpServer } from '../lib/sync/mcpSync';
import type { RuntimeMessage, RuntimeResponse } from '../lib/messages';

const REFRESH_ALARM = 'whatnext-refresh';
const DIGEST_ALARM = 'whatnext-digest';

async function ensureDefaults(): Promise<void> {
  const existing = await indexedDbStorage.getPreferences();
  if (!existing || Object.keys(existing).length === 0) {
    await indexedDbStorage.savePreferences(DEFAULT_PREFERENCES);
  }
}

async function refreshRecommendations(): Promise<EngineResult> {
  const profile = await indexedDbStorage.getInterestProfile();
  await indexedDbStorage.saveInterestProfile(decayProfile(profile));
  const result = await generateRecommendations(indexedDbStorage);
  await chrome.storage.session.set({ latestEngineResult: result });

  const prefs = await indexedDbStorage.getPreferences();
  if (prefs.mcpSyncEnabled && prefs.mcpSyncUrl) {
    syncToMcpServer(indexedDbStorage, prefs.mcpSyncUrl).catch(() => {
      /* best-effort — MCP server may not be running */
    });
  }

  return result;
}

async function refreshDigest(): Promise<void> {
  const result = await refreshRecommendations();
  const digest = buildDailyDigest(result.feed);
  await indexedDbStorage.saveDigest(digest);

  if (digest.topRecommendation) {
    chrome.notifications.create(`whatnext-digest-${digest.date}`, {
      type: 'basic',
      iconUrl: 'icons/icon-128.png',
      title: 'WhatNext? — Your top pick today',
      message: digest.topRecommendation.title,
      priority: 1,
    });
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  await ensureDefaults();
  chrome.alarms.create(REFRESH_ALARM, { periodInMinutes: 180 });
  chrome.alarms.create(DIGEST_ALARM, { periodInMinutes: 60 * 24 });
  chrome.contextMenus.create({
    id: 'whatnext-what-next',
    title: 'What should I do next?',
    contexts: ['page'],
  });
  await refreshRecommendations();
});

// Show a recommendation notification every time the user opens Chrome
chrome.runtime.onStartup.addListener(async () => {
  const result = await refreshRecommendations();
  const top = result.feed[0];
  if (!top) return;

  const notifId = `whatnext-startup-${Date.now()}`;
  chrome.notifications.create(notifId, {
    type: 'basic',
    iconUrl: 'icons/icon-128.png',
    title: '⚡ WhatNext? — Your top pick right now',
    message: top.title,
    contextMessage: top.whyNow.slice(0, 100) + (top.whyNow.length > 100 ? '…' : ''),
    priority: 2,
    requireInteraction: false,
  });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === REFRESH_ALARM) await refreshRecommendations();
  if (alarm.name === DIGEST_ALARM) await refreshDigest();
});

// Clicking any WhatNext notification opens the full feed
chrome.notifications.onClicked.addListener((notifId) => {
  if (!notifId.startsWith('whatnext-')) return;
  chrome.tabs.create({ url: chrome.runtime.getURL('newtab/index.html') });
  chrome.notifications.clear(notifId);
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== 'whatnext-what-next') return;
  await refreshRecommendations();
  chrome.tabs.create({ url: chrome.runtime.getURL('newtab/index.html') });
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'whatnext-instant') return;
  await refreshRecommendations();
  chrome.tabs.create({ url: chrome.runtime.getURL('newtab/index.html') });
});

chrome.runtime.onMessage.addListener((message: RuntimeMessage, _sender, sendResponse) => {
  handleMessage(message)
    .then((res) => sendResponse(res))
    .catch((err: unknown) =>
      sendResponse({ ok: false, error: err instanceof Error ? err.message : String(err) }),
    );
  return true; // keep the message channel open for the async response
});

async function handleMessage(message: RuntimeMessage): Promise<RuntimeResponse> {
  switch (message.type) {
    case 'PAGE_SIGNAL': {
      const prefs = await indexedDbStorage.getPreferences();
      const signal = buildSignalFromPageVisit({
        url: message.url,
        title: message.title,
        description: message.description,
        blocklist: prefs.domainBlocklist,
      });
      if (!signal) return { ok: true, data: { captured: false } };
      await indexedDbStorage.addSignal(signal);
      const profile = await indexedDbStorage.getInterestProfile();
      await indexedDbStorage.saveInterestProfile(applySignals(profile, [signal]));
      return { ok: true, data: { captured: true } };
    }

    case 'SEARCH_SIGNAL': {
      const signal = buildSignalFromSearch(message.query);
      if (!signal) return { ok: true, data: { captured: false } };
      await indexedDbStorage.addSignal(signal);
      const profile = await indexedDbStorage.getInterestProfile();
      await indexedDbStorage.saveInterestProfile(applySignals(profile, [signal]));
      return { ok: true, data: { captured: true } };
    }

    case 'GENERATE_NOW': {
      const result = await refreshRecommendations();
      return { ok: true, data: result };
    }

    case 'GET_LATEST_ENGINE_RESULT': {
      const cached = await chrome.storage.session.get('latestEngineResult');
      if (cached.latestEngineResult) return { ok: true, data: cached.latestEngineResult };
      const result = await refreshRecommendations();
      return { ok: true, data: result };
    }

    case 'GET_TODAY_DIGEST': {
      const existing = await indexedDbStorage.getDigest(todayKey());
      if (existing) return { ok: true, data: existing };
      const result = await refreshRecommendations();
      const digest = buildDailyDigest(result.feed);
      await indexedDbStorage.saveDigest(digest);
      return { ok: true, data: digest };
    }

    case 'SUBMIT_FEEDBACK': {
      await recordFeedback(indexedDbStorage, message.recommendation, message.feedback);
      return { ok: true };
    }

    case 'CLEAR_ALL_DATA': {
      await indexedDbStorage.clearAll();
      await indexedDbStorage.savePreferences(DEFAULT_PREFERENCES);
      await chrome.storage.session.clear();
      return { ok: true };
    }

    case 'TOGGLE_CATEGORY': {
      const prefs = await indexedDbStorage.getPreferences();
      const disabled = new Set(prefs.disabledCategories);
      if (message.enabled) disabled.delete(message.category);
      else disabled.add(message.category);
      await indexedDbStorage.savePreferences({ ...prefs, disabledCategories: [...disabled] });
      return { ok: true };
    }

    default:
      return { ok: false, error: 'Unknown message type' };
  }
}
