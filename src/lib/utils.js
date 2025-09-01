import { clsx } from 'clsx';

/**
 * Utility function to merge CSS classes
 * Uses clsx to combine classes conditionally
 */
export function cn(...inputs) {
  return clsx(inputs);
}

/**
 * Format a date to a readable string
 */
export function formatDate(date, options = {}) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(new Date(date));
}

/**
 * Format a number as currency
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Debounce function to limit the rate of function execution
 */
export function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Generate a random ID
 */
export function generateId(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Sleep/delay function for async operations
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if we're in a browser environment
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Safe localStorage access
 */
export const localStorage = {
  getItem: (key) => {
    if (!isBrowser) return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    if (!isBrowser) return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      console.error('Failed to set localStorage item');
    }
  },
  removeItem: (key) => {
    if (!isBrowser) return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      console.error('Failed to remove localStorage item');
    }
  },
};

/**
 * Truncate text with ellipsis
 */
export function truncate(text, length = 50) {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}