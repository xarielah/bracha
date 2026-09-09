import { getHoliday } from '../data/holidays';

export const MESSAGE_MAX_WORDS = 60;
export const NAMES_MAX_LEN = 120;
export const MESSAGE_MAX_LEN = 800;

export interface GreetingInput {
  holiday: string;
  fromNames: string;
  toNames: string;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: Record<string, string>;
  value: GreetingInput;
}

export function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

function clean(s: unknown, maxLen: number): string {
  return String(s ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

export function validateGreetingInput(raw: Record<string, unknown>): ValidationResult {
  const value: GreetingInput = {
    holiday: clean(raw.holiday, 40),
    fromNames: clean(raw.fromNames, NAMES_MAX_LEN),
    toNames: clean(raw.toNames, NAMES_MAX_LEN),
    message: String(raw.message ?? '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, MESSAGE_MAX_LEN),
  };

  const errors: Record<string, string> = {};

  if (!getHoliday(value.holiday)) {
    errors.holiday = 'חג לא קיים';
  }
  if (!value.fromNames) {
    errors.fromNames = 'יש למלא את שם המברך/ת';
  }
  if (!value.toNames) {
    errors.toNames = 'יש למלא את שם המבורך/ת';
  }
  if (countWords(value.message) > MESSAGE_MAX_WORDS) {
    errors.message = `המלל ארוך מדי – עד ${MESSAGE_MAX_WORDS} מילים`;
  }

  return { ok: Object.keys(errors).length === 0, errors, value };
}

/** Escape user text for safe rendering inside HTML. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
