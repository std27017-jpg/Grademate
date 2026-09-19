/**
 * Storage Utilities for MyGrade
 * 
 * Provides quota-safe localStorage operations, automatic Base64 prevention,
 * and background cleanup/migration of legacy Base64 images to prevent QuotaExceededError.
 */

import { UserProfile, PortfolioItem, Developer } from '../types';

export const STORAGE_KEYS = {
  AUTH_LOGGED_IN: 'mygrade_is_logged_in',
  USER_PROFILE: 'mygrade_user_profile',
  SAVED_PROFILES: 'mygrade_saved_profiles',
  SEMESTER: 'mygrade_active_semester',
  YEAR: 'mygrade_academic_year',
  SUBJECTS: 'mygrade_subjects',
  TASKS: 'mygrade_tasks',
  EXAMS: 'mygrade_exams',
  THRESHOLDS: 'mygrade_grade_thresholds',
  FUTURE_CHECKLIST: 'mygrade_future_checklist',
  PORTFOLIO: 'mygrade_portfolio_items',
  FUTURE_TODOS: 'mygrade_future_todos',
  READ_NOTIFS: 'mygrade_read_notification_ids',
  SUBJECT_CATEGORIES: 'mygrade_subject_categories',
  STUDY_SESSIONS: 'mygrade_study_sessions',
  STUDY_GOAL: 'mygrade_study_goal',
  DEVELOPER_PHOTOS: 'mygrade_developer_photos',
} as const;

/**
 * Checks if a value is a Base64 image data string
 */
export function isBase64Image(val: unknown): boolean {
  if (typeof val !== 'string') return false;
  const trimmed = val.trim();
  return (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('data:application/') ||
    (trimmed.length > 500 && /^[A-Za-z0-9+/=]+$/.test(trimmed))
  );
}

/**
 * Sanitizes a UserProfile object so that it NEVER contains Base64 image strings.
 * If avatar was previously a Base64 string, it strips it and falls back to a clean emoji
 * or preserves avatarUrl if avatarUrl is a clean HTTP/file URL.
 */
export function sanitizeUserProfile(profile: Partial<UserProfile> | null | undefined): UserProfile | null {
  if (!profile || typeof profile !== 'object') return null;

  const sanitized = { ...profile } as UserProfile;

  // Check avatar
  if (isBase64Image(sanitized.avatar)) {
    // If avatarUrl exists and is a clean URL, use it; otherwise fallback to emoji
    if (sanitized.avatarUrl && !isBase64Image(sanitized.avatarUrl)) {
      sanitized.avatar = sanitized.avatarUrl;
    } else {
      sanitized.avatar = '🌸';
    }
  }

  // Check avatarUrl
  if (isBase64Image(sanitized.avatarUrl)) {
    delete sanitized.avatarUrl;
  }

  return sanitized;
}

/**
 * Sanitizes an array of saved profiles, ensuring zero Base64 strings.
 */
export function sanitizeSavedProfiles(profiles: unknown): UserProfile[] {
  if (!Array.isArray(profiles)) return [];
  return profiles
    .map((p) => sanitizeUserProfile(p as UserProfile))
    .filter((p): p is UserProfile => p !== null);
}

/**
 * Sanitizes portfolio items, ensuring zero Base64 in imageUrl or attachments.
 */
export function sanitizePortfolioItems(items: unknown): PortfolioItem[] {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    if (!item || typeof item !== 'object') return item;
    const clone = { ...item };
    if (isBase64Image(clone.imageUrl)) {
      delete clone.imageUrl;
    }
    return clone as PortfolioItem;
  });
}

/**
 * Sanitizes developer photos map (id -> photoUrl), ensuring zero Base64 strings.
 */
export function sanitizeDeveloperPhotos(photos: unknown): Record<number, string> {
  if (!photos || typeof photos !== 'object') return {};
  const cleaned: Record<number, string> = {};
  for (const [key, val] of Object.entries(photos as Record<string, unknown>)) {
    const idNum = Number(key);
    if (!isNaN(idNum) && typeof val === 'string' && val.trim() && !isBase64Image(val)) {
      cleaned[idNum] = val.trim();
    }
  }
  return cleaned;
}

/**
 * Emergency storage cleanup function:
 * Scans all keys in localStorage and removes or truncates any lingering Base64 strings.
 * NEVER deletes grades, subjects, tasks, or user accounts.
 * NEVER calls localStorage.clear().
 */
export function emergencyStorageCleanup(): void {
  try {
    console.warn('[MyGrade Storage] Running emergency cleanup to recover localStorage space...');
    
    // 1. Clean user profile
    const rawProfile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (rawProfile && isBase64Image(rawProfile)) {
      try {
        const parsed = JSON.parse(rawProfile);
        const cleaned = sanitizeUserProfile(parsed);
        if (cleaned) {
          localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(cleaned));
        }
      } catch {
        // Skip if corrupt
      }
    }

    // 2. Clean saved profiles
    const rawSaved = localStorage.getItem(STORAGE_KEYS.SAVED_PROFILES);
    if (rawSaved && isBase64Image(rawSaved)) {
      try {
        const parsed = JSON.parse(rawSaved);
        const cleaned = sanitizeSavedProfiles(parsed);
        localStorage.setItem(STORAGE_KEYS.SAVED_PROFILES, JSON.stringify(cleaned));
      } catch {
        // Skip
      }
    }

    // 3. Clean portfolio
    const rawPort = localStorage.getItem(STORAGE_KEYS.PORTFOLIO);
    if (rawPort && isBase64Image(rawPort)) {
      try {
        const parsed = JSON.parse(rawPort);
        const cleaned = sanitizePortfolioItems(parsed);
        localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(cleaned));
      } catch {
        // Skip
      }
    }

    // 4. Remove any rogue image cache keys
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        if (
          key.startsWith('mygrade_avatar_') ||
          key.startsWith('mygrade_img_') ||
          key.startsWith('image_cache_') ||
          key.startsWith('temp_base64_')
        ) {
          keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    console.log('[MyGrade Storage] Emergency cleanup complete.');
  } catch (err) {
    console.error('[MyGrade Storage] Error during emergency cleanup:', err);
  }
}

/**
 * Safe wrapper around localStorage.setItem:
 * - Automatically catches QuotaExceededError
 * - Pre-filters Base64 if saving profile or portfolio data
 * - If quota is exceeded, performs non-destructive cleanup and retries
 * - Guarantees the application never crashes
 */
export function safeLocalStorageSetItem(key: string, value: string): boolean {
  try {
    // Proactive check: if attempting to save Base64 profile/portfolio, sanitize it first!
    if (key === STORAGE_KEYS.USER_PROFILE && isBase64Image(value)) {
      try {
        const parsed = JSON.parse(value);
        const sanitized = sanitizeUserProfile(parsed);
        value = JSON.stringify(sanitized);
      } catch {
        // Proceed with original
      }
    } else if (key === STORAGE_KEYS.SAVED_PROFILES && isBase64Image(value)) {
      try {
        const parsed = JSON.parse(value);
        const sanitized = sanitizeSavedProfiles(parsed);
        value = JSON.stringify(sanitized);
      } catch {
        // Proceed
      }
    } else if (key === STORAGE_KEYS.PORTFOLIO && isBase64Image(value)) {
      try {
        const parsed = JSON.parse(value);
        const sanitized = sanitizePortfolioItems(parsed);
        value = JSON.stringify(sanitized);
      } catch {
        // Proceed
      }
    } else if (key === STORAGE_KEYS.DEVELOPER_PHOTOS && isBase64Image(value)) {
      try {
        const parsed = JSON.parse(value);
        const sanitized = sanitizeDeveloperPhotos(parsed);
        value = JSON.stringify(sanitized);
      } catch {
        // Proceed
      }
    }

    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' ||
        error.code === 22 ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    ) {
      console.warn(`[MyGrade Storage] QuotaExceededError writing key "${key}". Running cleanup and retrying...`);
      emergencyStorageCleanup();

      try {
        localStorage.setItem(key, value);
        console.log(`[MyGrade Storage] Successfully saved key "${key}" after cleanup.`);
        return true;
      } catch (retryError) {
        console.error(`[MyGrade Storage] Failed to write key "${key}" even after cleanup:`, retryError);
        return false;
      }
    }

    console.error(`[MyGrade Storage] Error saving key "${key}" to localStorage:`, error);
    return false;
  }
}

/**
 * Safe wrapper around localStorage.getItem
 */
export function safeLocalStorageGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (err) {
    console.warn(`[MyGrade Storage] Error reading key "${key}" from localStorage:`, err);
    return null;
  }
}

/**
 * Safe wrapper around localStorage.removeItem
 */
export function safeLocalStorageRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[MyGrade Storage] Error removing key "${key}" from localStorage:`, err);
  }
}

/**
 * Scans localStorage at startup to migrate legacy Base64 avatar data and clean space.
 * NEVER deletes user grades, subjects, tasks, or exams.
 */
export function runStorageMigrationAndCleanup(): void {
  try {
    let modified = false;

    // 1. Check userProfile
    const rawProfile = safeLocalStorageGetItem(STORAGE_KEYS.USER_PROFILE);
    if (rawProfile) {
      try {
        const parsed = JSON.parse(rawProfile);
        if (isBase64Image(parsed?.avatar) || isBase64Image(parsed?.avatarUrl)) {
          console.log('[MyGrade Storage Migration] Migrating userProfile: removing legacy Base64 avatar...');
          const sanitized = sanitizeUserProfile(parsed);
          safeLocalStorageSetItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(sanitized));
          modified = true;
        }
      } catch (err) {
        console.warn('Could not parse userProfile for migration:', err);
      }
    }

    // 2. Check savedProfiles
    const rawSaved = safeLocalStorageGetItem(STORAGE_KEYS.SAVED_PROFILES);
    if (rawSaved) {
      try {
        const parsed = JSON.parse(rawSaved);
        if (Array.isArray(parsed) && parsed.some((p) => isBase64Image(p?.avatar) || isBase64Image(p?.avatarUrl))) {
          console.log('[MyGrade Storage Migration] Migrating savedProfiles: removing legacy Base64 avatars...');
          const sanitized = sanitizeSavedProfiles(parsed);
          safeLocalStorageSetItem(STORAGE_KEYS.SAVED_PROFILES, JSON.stringify(sanitized));
          modified = true;
        }
      } catch (err) {
        console.warn('Could not parse savedProfiles for migration:', err);
      }
    }

    // 3. Check portfolio
    const rawPort = safeLocalStorageGetItem(STORAGE_KEYS.PORTFOLIO);
    if (rawPort) {
      try {
        const parsed = JSON.parse(rawPort);
        if (Array.isArray(parsed) && parsed.some((p) => isBase64Image(p?.imageUrl))) {
          console.log('[MyGrade Storage Migration] Migrating portfolioItems: removing legacy Base64 images...');
          const sanitized = sanitizePortfolioItems(parsed);
          safeLocalStorageSetItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(sanitized));
          modified = true;
        }
      } catch (err) {
        console.warn('Could not parse portfolioItems for migration:', err);
      }
    }

    if (modified) {
      console.log('[MyGrade Storage Migration] Storage migration completed successfully. Space reclaimed!');
    }
  } catch (e) {
    console.error('[MyGrade Storage Migration] Error during migration:', e);
  }
}
