import { SM2State } from '@/types';

/**
 * Calculate the next review date using the SM-2 algorithm
 * @param state Current SM2 state
 * @param quality User rating (0-5)
 * @returns Updated SM2 state
 */
export function calculateNextReview(
  state: SM2State,
  quality: number
): SM2State {
  let { repetition, interval, easinessFactor } = state;

  // If quality is less than 3, reset repetition and interval
  if (quality < 3) {
    repetition = 0;
    interval = 1;
  } else {
    repetition += 1;
    
    if (repetition === 1) {
      interval = 1;
    } else if (repetition === 2) {
      interval = 3;
    } else if (repetition === 3) {
      interval = 5;
    } else {
      interval = Math.round(interval * easinessFactor);
    }
  }

  // Update easiness factor
  easinessFactor = Math.max(
    1.3,
    easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  return {
    repetition,
    interval,
    easinessFactor: Math.round(easinessFactor * 100) / 100,
  };
}

/**
 * Get the next review date based on interval
 * @param intervalDays Number of days until next review
 * @returns ISO date string for next review
 */
export function getNextReviewDate(intervalDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + intervalDays);
  return date.toISOString().split('T')[0];
}

/**
 * Check if a card is due for review
 * @param nextReviewDate ISO date string
 * @returns boolean
 */
export function isDueForReview(nextReviewDate: string | null): boolean {
  if (!nextReviewDate) return true;
  const today = new Date().toISOString().split('T')[0];
  return nextReviewDate <= today;
}

/**
 * Get initial SM2 state for new cards
 */
export function getInitialSM2State(): SM2State {
  return {
    repetition: 0,
    interval: 1,
    easinessFactor: 2.5,
  };
}
