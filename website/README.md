# WhatNext Website

Landing page for downloading the WhatNext Chrome extension.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- shadcn-style layout (`src/components/ui`, `components.json`)

## Develop

From the monorepo root:

```bash
npm install
npm run dev:web
```

Or from this folder:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pack extension zip for download

```bash
# from monorepo root
npm run build
cd website
npm run pack:extension
```

This writes `public/whatnext-extension.zip` for the **Download ZIP** button.
