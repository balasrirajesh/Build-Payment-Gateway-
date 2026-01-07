// 1. VPA Validation
export const validateVPA = (vpa: string): boolean => {
  if (!vpa) return false;
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(vpa);
};

// 2. Luhn Algorithm (Card Validation)
export const validateCardNumber = (number: string): boolean => {
  if (!number) return false;
  const cleanNum = number.replace(/[\s-]/g, '');
  if (!/^\d{13,19}$/.test(cleanNum)) return false;

  let sum = 0;
  let shouldDouble = false;
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
  const twoDigit = parseInt(cleanNum.substring(0, 2));
  if (twoDigit >= 51 && twoDigit <= 55) return 'mastercard';
  if (twoDigit === 34 || twoDigit === 37) return 'amex';
  if (twoDigit === 60 || twoDigit === 65 || (twoDigit >= 81 && twoDigit <= 89)) return 'rupay';
  return 'unknown';
};

// 4. Expiry Validation
export const validateExpiry = (month: string | number, year: string | number): boolean => {
  if (!month || !year) return false;
  const current = new Date();
  const currentYear = current.getFullYear();
  const currentMonth = current.getMonth() + 1;

  let expYear = typeof year === 'string' ? parseInt(year) : year;
  let expMonth = typeof month === 'string' ? parseInt(month) : month;

  if (expYear < 100) expYear += 2000; 
  if (expYear < currentYear) return false;
  if (expYear === currentYear && expMonth < currentMonth) return false;
  return true;
};