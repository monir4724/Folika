// Utility to format Arabic numbers (1, 2, 3) to Bangla numerals (১, ২, ৩) and vice versa

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const EN_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function formatNumeral(input: number | string | undefined | null, targetLocale: 'bn' | 'en' = 'bn'): string {
  if (input === undefined || input === null) return '';
  const str = String(input);
  if (targetLocale === 'en') {
    return str.replace(/[০-৯]/g, (w) => EN_DIGITS[BN_DIGITS.indexOf(w)] || w);
  }
  return str.replace(/[0-9]/g, (w) => BN_DIGITS[parseInt(w, 10)] || w);
}

export function parseNumeralToEn(input: string): string {
  return input.replace(/[০-৯]/g, (w) => String(BN_DIGITS.indexOf(w)));
}
