import type { Category, EngineResult, FeedbackType, Recommendation } from '@whatnext/core';

export type RuntimeMessage =
  | { type: 'PAGE_SIGNAL'; url: string; title: string; description: string }
  | { type: 'SEARCH_SIGNAL'; query: string }
  | { type: 'GENERATE_NOW' }
  | { type: 'GET_LATEST_ENGINE_RESULT' }
  | { type: 'GET_TODAY_DIGEST' }
  | { type: 'SUBMIT_FEEDBACK'; recommendation: Recommendation; feedback: FeedbackType }
  | { type: 'CLEAR_ALL_DATA' }
  | { type: 'TOGGLE_CATEGORY'; category: Category; enabled: boolean };

export interface RuntimeResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

export function sendRuntimeMessage<T = unknown>(message: RuntimeMessage): Promise<RuntimeResponse<T>> {
  return new Promise((resolveMsg) => {
    chrome.runtime.sendMessage(message, (response: RuntimeResponse<T>) => {
      if (chrome.runtime.lastError) {
        resolveMsg({ ok: false, error: chrome.runtime.lastError.message });
        return;
      }
      resolveMsg(response ?? { ok: false, error: 'No response from background worker' });
    });
  });
}

export type { EngineResult };
