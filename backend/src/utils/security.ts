import crypto from 'crypto';

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return input;

  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
};

/**
 * Sanitize object recursively
 */
export const sanitizeObject = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return typeof obj === 'string' ? sanitizeInput(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
  }

  return sanitized;
};

/**
 * Generate secure random token
 */
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Mask sensitive data for logging
 */
export const maskSensitiveData = (data: any, fieldsToMask: string[] = ['password', 'token', 'secret']): any => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveData(item, fieldsToMask));
  }

  const masked: any = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      if (fieldsToMask.includes(key.toLowerCase())) {
        masked[key] = '***MASKED***';
      } else if (typeof data[key] === 'object') {
        masked[key] = maskSensitiveData(data[key], fieldsToMask);
      } else {
        masked[key] = data[key];
      }
    }
  }

  return masked;
};

/**
 * Validate file type
 */
export const isValidFileType = (filename: string, allowedTypes: string[]): boolean => {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? allowedTypes.includes(ext) : false;
};

/**
 * Check if string contains potential SQL injection or NoSQL injection patterns
 */
export const containsInjectionPatterns = (input: string): boolean => {
  const patterns = [
    /(\$where|\$ne|\$gt|\$lt|\$or|\$and)/i, // NoSQL injection
    /(;|--|\/\*|\*\/|xp_|sp_|exec|execute|select|insert|update|delete|drop|create|alter)/i, // SQL injection
  ];

  return patterns.some((pattern) => pattern.test(input));
};

/**
 * Rate limit key generator based on IP or user ID
 */
export const generateRateLimitKey = (identifier: string, action: string): string => {
  return `ratelimit:${action}:${identifier}`;
};
