import type { Provider } from './types.js';
import { movieProvider } from './movieProvider.js';
import { bookProvider } from './bookProvider.js';
import { githubProvider } from './githubProvider.js';
import { learningProvider } from './learningProvider.js';
import { codingProjectProvider } from './codingProjectProvider.js';
import { fitnessProvider } from './fitnessProvider.js';
import { careerProvider } from './careerProvider.js';
import { toolProvider } from './toolProvider.js';
import { newsProvider } from './newsProvider.js';
import { travelProvider } from './travelProvider.js';
import { financeProvider } from './financeProvider.js';
import { cookingProvider } from './cookingProvider.js';

export const ALL_PROVIDERS: Provider[] = [
  movieProvider,
  bookProvider,
  githubProvider,
  learningProvider,
  codingProjectProvider,
  fitnessProvider,
  careerProvider,
  toolProvider,
  newsProvider,
  travelProvider,
  financeProvider,
  cookingProvider,
];

export * from './types.js';
