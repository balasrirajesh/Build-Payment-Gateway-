// 1. VPA Validation (Regex)
export const validateVPA = (vpa: string): boolean => {
  // Pattern: alphanumeric/dots/underscores/hyphens + @ + alphanumeric
  const vpaRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
  return vpaRegex.test(vpa);
};

// 2. Luhn Algorithm (Card Validation)
export const validateCardNumber = (number: string): boolean => {
  // Remove spaces/dashes
  const cleanNum = number.replace(/[\s-]/g, '');
  
  // Check if numeric and length is valid (13-19)
  if (!/^\d{13,19}$/.test(cleanNum)) return false;

  let sum = 0;
  let shouldDouble = false;

  // Loop from right to left
  for (let i = cleanNum.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNum.charAt(i));

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return (sum % 10) === 0;
};

// 3. Card Network Detection
export const getCardNetwork = (number: string): string => {
  const cleanNum = number.replace(/[\s-]/g, '');
  
  if (cleanNum.startsWith('4')) return 'visa';
  
  // Mastercard: 51-55
  const twoDigits = parseInt(cleanNum.substring(0, 2));
  if (twoDigits >= 51 && twoDigits <= 55) return 'mastercard';
  
  // Amex: 34, 37
  if (twoDigits === 34 || twoDigits === 37) return 'amex';
  
  // RuPay: 60, 65, 81-89
  if (twoDigits === 60 || twoDigits === 65 || (twoDigits >= 81 && twoDigits <= 89)) return 'rupay';

  return 'unknown';
};

// 4. Expiry Validation
export const validateExpiry = (month: string, year: string): boolean => {
  const expMonth = parseInt(month);
  let expYear = parseInt(year);

  // Handle 2-digit year (e.g., "25" -> 2025)
  if (year.length === 2) expYear += 2000;

  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 0-indexed
  const currentYear = now.getFullYear();

  if (expYear < currentYear) return false;
  if (expYear === currentYear && expMonth < currentMonth) return false;
  
  return expMonth >= 1 && expMonth <= 12;
};