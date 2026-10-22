/**
 * Share utilities for generating public, student-accessible links
 * and reliable clipboard copying in all environments (including iframes).
 */

export const SHARED_APP_URL = 'https://ais-pre-cz4zowbns7hkye3rwghhjr-678664052182.asia-southeast1.run.app';

/**
 * Returns the public teacher link for full access to attendance, schedule,
 * grades, and all groups.
 */
export function getTeacherLink(): string {
  let origin = SHARED_APP_URL;

  if (typeof window !== 'undefined') {
    const curOrigin = window.location.origin;
    if (curOrigin.includes('ais-pre-')) {
      origin = curOrigin;
    } else if (curOrigin.includes('ais-dev-')) {
      origin = curOrigin.replace('ais-dev-', 'ais-pre-');
    }
  }

  return `${origin}?view=teacher`;
}

/**
 * Returns the public student link that works for any external user/phone
 * without requiring Google AI Studio login or developer permissions.
 */
export function getPublicStudentLink(groupName?: string, studentId?: string): string {
  let origin = SHARED_APP_URL;

  if (typeof window !== 'undefined') {
    const curOrigin = window.location.origin;
    if (curOrigin.includes('ais-pre-')) {
      origin = curOrigin;
    } else if (curOrigin.includes('ais-dev-')) {
      // Convert developer URL to public shared URL
      origin = curOrigin.replace('ais-dev-', 'ais-pre-');
    } else if (curOrigin.includes('localhost') || curOrigin.includes('127.0.0.1')) {
      // In local dev, always use the public shared URL so students can actually open it
      origin = SHARED_APP_URL;
    } else {
      origin = SHARED_APP_URL;
    }
  }

  const url = new URL(origin);
  url.searchParams.set('view', 'student');
  if (groupName) {
    url.searchParams.set('group', groupName);
  }
  if (studentId) {
    url.searchParams.set('student', studentId);
  }
  return url.toString();
}

/**
 * Robust clipboard copy function that works across iframes, mobile browsers,
 * and environments where navigator.clipboard.writeText is restricted.
 */
export async function copyTextFallback(text: string): Promise<boolean> {
  // 1. Try modern clipboard API
  if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // Fall through to execCommand
    }
  }

  // 2. Fallback to textarea + execCommand
  if (typeof document !== 'undefined') {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      textArea.style.opacity = '0';
      textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      return false;
    }
  }

  return false;
}
