import express from 'express';
import cors from 'cors';
import type { Server } from 'node:http';
import { jsonFileStorage } from '../storage/jsonFileAdapter.js';

const PORT = Number(process.env.WHATNEXT_SYNC_PORT ?? 8787);

export function startSyncServer(): Server {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '2mb' }));

  // simple guard: only accept connections from the local machine
  app.use((req, res, next) => {
    const ip = req.socket.remoteAddress ?? '';
    if (ip.includes('127.0.0.1') || ip.includes('::1') || ip.includes('::ffff:127.0.0.1')) {
      next();
      return;
    }
    res.status(403).json({ ok: false, error: 'WhatNext MCP sync only accepts local connections' });
  });

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'whatnext-mcp-sync' });
  });

  app.post('/sync/profile', async (req, res) => {
    await jsonFileStorage.saveInterestProfile(req.body ?? {});
    res.json({ ok: true });
  });

  app.post('/sync/preferences', async (req, res) => {
    const current = await jsonFileStorage.getPreferences();
    await jsonFileStorage.savePreferences({ ...current, ...req.body });
    res.json({ ok: true });
  });

  app.post('/sync/recommendations', async (req, res) => {
    await jsonFileStorage.addRecommendations(req.body ?? []);
    res.json({ ok: true });
  });

  app.post('/sync/feedback', async (req, res) => {
    for (const record of req.body ?? []) {
      await jsonFileStorage.addFeedback(record);
    }
    res.json({ ok: true });
  });

  return app.listen(PORT, '127.0.0.1', () => {
    console.error(`[whatnext-mcp] local sync API listening on http://127.0.0.1:${PORT}`);
  });
}
