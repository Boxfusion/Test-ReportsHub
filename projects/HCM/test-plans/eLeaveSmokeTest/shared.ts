// Shared state for the eLeave smoke-test CHAIN (apply -> recommend -> approve).
//
// This is NOT a spec file (playwright testMatch only picks up *.spec.ts), so it is never
// executed as a test — it is imported by the three specs in this folder.
//
// The apply spec submits a real leave application (under SEED_SUBMIT=1) and records its
// generated reference number here. The recommend and approve specs read it back so they act
// on THE SAME application the apply spec submitted, instead of an arbitrary inbox row.

import * as fs from 'fs';
import * as path from 'path';

const REF_FILE = path.join(__dirname, '.submitted-application.json');

export interface SubmittedApplication {
  ref: string;          // e.g. "LA2026/12498"
  startDate: string;    // dd/mm/yyyy
  savedAt: string;      // ISO timestamp
}

/** Persist the application the apply spec just submitted so recommend/approve can target it. */
export function saveSubmittedApplication(app: { ref: string; startDate: string }): void {
  const payload: SubmittedApplication = { ...app, savedAt: new Date().toISOString() };
  fs.writeFileSync(REF_FILE, JSON.stringify(payload, null, 2));
}

/** Read back the submitted application (null if the apply spec has not run a seeded submit). */
export function loadSubmittedApplication(): SubmittedApplication | null {
  try {
    return JSON.parse(fs.readFileSync(REF_FILE, 'utf8')) as SubmittedApplication;
  } catch {
    return null;
  }
}

/** A RegExp that matches an inbox row by its leave reference number. */
export function refRowPattern(ref: string): RegExp {
  // Escape regex metacharacters (the ref contains a '/').
  return new RegExp(ref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
}
