// Password validation utilities
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number; // 0-100
}

export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  maxLength?: number;
}

export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSymbols: true,
  maxLength: 128,
};

export function validatePassword(
  password: string,
  requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS
): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  // Length validation
  if (password.length < requirements.minLength) {
    errors.push(`Password must be at least ${requirements.minLength} characters long`);
  } else {
    score += 20;
  }

  if (requirements.maxLength && password.length > requirements.maxLength) {
    errors.push(`Password must be no more than ${requirements.maxLength} characters long`);
  }

  // Character type validation
  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (requirements.requireUppercase) {
    score += 20;
  }

  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (requirements.requireLowercase) {
    score += 20;
  }

  if (requirements.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else if (requirements.requireNumbers) {
    score += 20;
  }

  if (requirements.requireSymbols && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else if (requirements.requireSymbols) {
    score += 20;
  }

  // Additional strength factors
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
    score += 10;
  }

  // Determine strength level
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  if (score < 40) strength = 'weak';
  else if (score < 60) strength = 'medium';
  else if (score < 80) strength = 'strong';
  else strength = 'very-strong';

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score: Math.min(score, 100),
  };
}

export function getPasswordStrengthColor(strength: string): string {
  switch (strength) {
    case 'weak': return 'text-red-600';
    case 'medium': return 'text-yellow-600';
    case 'strong': return 'text-blue-600';
    case 'very-strong': return 'text-green-600';
    default: return 'text-gray-600';
  }
}

export function getPasswordStrengthText(strength: string): string {
  switch (strength) {
    case 'weak': return 'Weak';
    case 'medium': return 'Medium';
    case 'strong': return 'Strong';
    case 'very-strong': return 'Very Strong';
    default: return 'Unknown';
  }
}

// Common weak passwords to check against
export const COMMON_WEAK_PASSWORDS = [
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1',
  'qwerty123', 'dragon', 'master', 'hello', 'freedom', 'whatever',
  'qazwsx', 'trustno1', '654321', 'jordan23', 'harley', 'password1',
  'jordan', 'jennifer', 'zxcvbn', 'asdfgh', '123123', 'qwertyuiop'
];

export function isCommonPassword(password: string): boolean {
  return COMMON_WEAK_PASSWORDS.includes(password.toLowerCase());
}
