import type { Candidate, InterestProfile, Preferences } from '../types.js';

export interface Provider {
  category: Candidate['category'];
  name: string;
  /**
   * Returns this provider's full candidate pool.
   * Receives user preferences (for API keys) and interest profile (for personalised queries).
   * Live providers fetch from external APIs; static providers resolve immediately.
   */
  getCandidates(prefs: Preferences, profile: InterestProfile): Promise<Candidate[]>;
}
