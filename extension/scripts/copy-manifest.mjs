import { copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
copyFileSync(resolve(__dirname, '../manifest.json'), resolve(__dirname, '../dist/manifest.json'));
console.log('copied manifest.json -> dist/manifest.json');
