const PHONE_DISPLAY = /^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/;
const PHONE_HTML_PATTERN = '^\\+7\\(\\d{3}\\)\\d{3}-\\d{2}-\\d{2}$';

export const PASSWORD_RULES_TEXT = 'не менее 8 символов, заглавная и строчная буквы, цифра и специальный знак; пробелы не допускаются.';

export function normalizePersonName(value) {
  return String(value ?? '').normalize('NFKC').trim().replace(/\s+/gu, ' ');
}

export function getPersonNameError(value, label = 'ФИО') {
  const name = normalizePersonName(value);
  if (name.length < 2 || name.length > 120) return `${label} должно содержать от 2 до 120 символов.`;
  const validParts = name.split(' ').every((part) => /^[\p{L}\p{M}]+(?:['’\-][\p{L}\p{M}]+)*\.?$/u.test(part));
  if (!validParts || name.replace(/[^\p{L}\p{M}]/gu, '').length < 2) {
    return `${label} может содержать буквы, пробелы, дефис, апостроф и точку после инициала.`;
  }
  return '';
}

export function normalizeEmail(value) {
  return String(value ?? '').normalize('NFKC').trim().toLowerCase();
}

export function isValidEmail(value) {
  const email = normalizeEmail(value);
  if (!email || email.length > 254 || /\s/u.test(email)) return false;
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (local.length < 1 || local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local)) return false;
  if (domain.length > 253) return false;
  const labels = domain.split('.');
  if (labels.length < 2 || labels.some((label) => !label || label.length > 63
    || !/^[\p{L}\p{N}](?:[\p{L}\p{N}-]*[\p{L}\p{N}])?$/u.test(label))) return false;
  return [...labels.at(-1)].length >= 2 && /\p{L}/u.test(labels.at(-1));
}

export function getEmailError(value) {
  return isValidEmail(value) ? '' : 'Укажите корректный email (например, name@example.com).';
}

export function getPasswordError(value) {
  const password = String(value ?? '');
  if (password.length < 8 || password.length > 128) return 'Пароль должен содержать от 8 до 128 символов.';
  if (/\s/u.test(password)) return 'Пароль не должен содержать пробелы.';
  if (!/\p{Ll}/u.test(password) || !/\p{Lu}/u.test(password)
    || !/[0-9]/.test(password) || !/[^\p{L}\p{N}\s]/u.test(password)) {
    return `Пароль должен содержать ${PASSWORD_RULES_TEXT}`;
  }
  return '';
}

function formatPhoneDigits(digits) {
  const local = digits.slice(0, 10);
  if (!local) return '+7';
  let result = `+7(${local.slice(0, 3)}`;
  if (local.length >= 3) result += ')';
  if (local.length > 3) result += local.slice(3, 6);
  if (local.length > 6) result += `-${local.slice(6, 8)}`;
  if (local.length > 8) result += `-${local.slice(8, 10)}`;
  return result;
}

// Formats live typing and pasted numbers as +7(xxx)xxx-xx-xx.
export function formatRussianPhoneInput(value) {
  const raw = String(value ?? '');
  if (!raw.trim()) return '';
  const digits = raw.replace(/\D/g, '');
  if (!digits) return raw.trim() === '+' ? '+' : '';
  let national = digits;
  if (/^\+7/u.test(raw.trim())) national = digits.slice(1);
  else if (national.length > 10 && /^[78]/u.test(national)) national = national.slice(1);
  return formatPhoneDigits(national);
}

// Server-side canonicalization accepts common separators while rejecting malformed or incomplete numbers.
export function normalizeRussianPhone(value) {
  const phone = String(value ?? '').trim();
  if (!phone || phone.length > 30 || !/^\+?[\d\s().-]+$/u.test(phone)) return '';
  const digits = phone.replace(/\D/g, '');
  const hasPlus = phone.startsWith('+');
  if (hasPlus && digits[0] !== '7') return '';
  let national;
  if (digits.length === 10 && !hasPlus) national = digits;
  else if (digits.length === 11 && (digits[0] === '7' || digits[0] === '8')) national = digits.slice(1);
  else return '';
  if (hasPlus && digits.length !== 11) return '';
  const formatted = formatPhoneDigits(national);
  return PHONE_DISPLAY.test(formatted) ? formatted : '';
}

export function isValidRussianPhone(value) {
  return PHONE_DISPLAY.test(String(value ?? ''));
}

export const RUSSIAN_PHONE_HTML_PATTERN = PHONE_HTML_PATTERN;

export function normalizeAddress(value) {
  return String(value ?? '').normalize('NFKC').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/gu, '').trim().replace(/\s+/gu, ' ');
}

export function getAddressError(value, label = 'Адрес') {
  const address = normalizeAddress(value);
  if (address.length < 5 || address.length > 250) return `${label} должен содержать от 5 до 250 символов.`;
  if (!/[\p{L}\p{N}]/u.test(address)) return `${label} должен содержать буквы или цифры.`;
  return '';
}
