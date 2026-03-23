/**
 * Security Utilities
 * Password validation and security helpers
 */

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
}

/**
 * Validate password strength
 * Returns a score from 0-4 and feedback messages
 */
export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Check length
  if (password.length >= 8) {
    score++;
  } else {
    feedback.push('Password must be at least 8 characters long');
  }

  if (password.length >= 12) {
    score++;
  }

  // Check for lowercase letters
  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push('Include lowercase letters');
  }

  // Check for uppercase letters
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('Include uppercase letters');
  }

  // Check for numbers
  if (/\d/.test(password)) {
    score++;
  } else {
    feedback.push('Include numbers');
  }

  // Check for special characters
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score++;
  } else {
    feedback.push('Include special characters');
  }

  // Normalize score to 0-4
  score = Math.min(4, Math.floor(score / 1.5));

  // Check for common patterns
  if (/^(.)\1+$/.test(password)) {
    feedback.push('Avoid repeating characters');
    score = Math.max(0, score - 2);
  }

  if (/^(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
    feedback.push('Avoid sequential characters');
    score = Math.max(0, score - 1);
  }

  // Common passwords check (basic)
  const commonPasswords = ['password', '12345678', 'qwerty', 'abc123', 'letmein', 'welcome', 'monkey', '1234567890'];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    feedback.push('Avoid common passwords');
    score = 0;
  }

  const isValid = score >= 2 && password.length >= 8;

  if (isValid && feedback.length === 0) {
    feedback.push('Strong password!');
  }

  return {
    score,
    feedback,
    isValid,
  };
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(score: number): string {
  switch (score) {
    case 0:
      return 'Very Weak';
    case 1:
      return 'Weak';
    case 2:
      return 'Fair';
    case 3:
      return 'Good';
    case 4:
      return 'Strong';
    default:
      return 'Unknown';
  }
}

/**
 * Get password strength color
 */
export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0:
      return '#f44336'; // red
    case 1:
      return '#ff9800'; // orange
    case 2:
      return '#ffc107'; // amber
    case 3:
      return '#8bc34a'; // light green
    case 4:
      return '#4caf50'; // green
    default:
      return '#9e9e9e'; // grey
  }
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate a random secure token
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export default {
  validatePasswordStrength,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
  sanitizeInput,
  isValidEmail,
  generateSecureToken,
};