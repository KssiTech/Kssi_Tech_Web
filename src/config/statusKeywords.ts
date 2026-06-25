import type { Status } from '@/types/dashboard';

// ─── Status classification rules (ordered by priority) ───────────────────────
// To support a new status vocabulary, add patterns here — no code changes needed.

export interface StatusRule {
  status: Status;
  priority: number;
  // Patterns matched against the comment field
  commentPatterns: RegExp[];
  // Patterns matched against the raw status/etat field
  statusPatterns: RegExp[];
}

export const STATUS_RULES: StatusRule[] = [
  {
    status: 'annule',
    priority: 1,
    commentPatterns: [/annul/i, /cancel/i, /resilie/i],
    statusPatterns:  [/annul/i, /cancel/i, /resilie/i],
  },
  {
    status: 'bloque',
    priority: 2,
    commentPatterns: [/blocage/i, /bloque/i],
    statusPatterns:  [/blocage|non.?install|bloque|blocked|incident|pb\b/i],
  },
  {
    status: 'installe',
    priority: 3,
    // installation_date presence is also checked in code
    commentPatterns: [/install[ée]/i, /\bdone\b/i, /realise/i, /termine/i, /complete/i, /raccorde/i],
    statusPatterns:  [/^ok$/i, /\binstall[ée]/i, /realise/i, /termine/i, /complete/i],
  },
  {
    status: 'planifie',
    priority: 4,
    // planned_date presence is also checked in code
    commentPatterns: [],
    statusPatterns:  [/planif/i, /programme/i, /scheduled/i],
  },
  {
    status: 'attente',
    priority: 5,
    commentPatterns: [/attente/i, /pending/i, /waiting/i],
    statusPatterns:  [/attente/i, /pending/i, /waiting/i],
  },
];

// Keywords that indicate a client is unreachable (used for AI & alerts)
export const UNREACHABLE_PATTERNS: RegExp[] = [
  /injoign/i, /indispon/i, /inaccess/i, /ne.?repond/i, /absent/i,
  /unreachable/i, /no.?answer/i,
];

// Map display labels back to Status keys (for filter UI)
export const LABEL_TO_STATUS: Record<string, Status> = {
  installe:  'installe',
  planifie:  'planifie',
  bloque:    'bloque',
  annule:    'annule',
  attente:   'attente',
};
