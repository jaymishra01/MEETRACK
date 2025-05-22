// List of countries with phone codes and currency information
export const COUNTRIES = [
  { name: 'Afghanistan', code: 'AF', phoneCode: '+93', currency: 'AFN', symbol: '؋' },
  { name: 'Albania', code: 'AL', phoneCode: '+355', currency: 'ALL', symbol: 'L' },
  { name: 'Algeria', code: 'DZ', phoneCode: '+213', currency: 'DZD', symbol: 'د.ج' },
  { name: 'Argentina', code: 'AR', phoneCode: '+54', currency: 'ARS', symbol: '$' },
  { name: 'Australia', code: 'AU', phoneCode: '+61', currency: 'AUD', symbol: '$' },
  { name: 'Austria', code: 'AT', phoneCode: '+43', currency: 'EUR', symbol: '€' },
  { name: 'Bangladesh', code: 'BD', phoneCode: '+880', currency: 'BDT', symbol: '৳' },
  { name: 'Belgium', code: 'BE', phoneCode: '+32', currency: 'EUR', symbol: '€' },
  { name: 'Brazil', code: 'BR', phoneCode: '+55', currency: 'BRL', symbol: 'R$' },
  { name: 'Canada', code: 'CA', phoneCode: '+1', currency: 'CAD', symbol: '$' },
  { name: 'China', code: 'CN', phoneCode: '+86', currency: 'CNY', symbol: '¥' },
  { name: 'Denmark', code: 'DK', phoneCode: '+45', currency: 'DKK', symbol: 'kr' },
  { name: 'Egypt', code: 'EG', phoneCode: '+20', currency: 'EGP', symbol: '£' },
  { name: 'France', code: 'FR', phoneCode: '+33', currency: 'EUR', symbol: '€' },
  { name: 'Germany', code: 'DE', phoneCode: '+49', currency: 'EUR', symbol: '€' },
  { name: 'Greece', code: 'GR', phoneCode: '+30', currency: 'EUR', symbol: '€' },
  { name: 'Hong Kong', code: 'HK', phoneCode: '+852', currency: 'HKD', symbol: '$' },
  { name: 'India', code: 'IN', phoneCode: '+91', currency: 'INR', symbol: '₹' },
  { name: 'Indonesia', code: 'ID', phoneCode: '+62', currency: 'IDR', symbol: 'Rp' },
  { name: 'Ireland', code: 'IE', phoneCode: '+353', currency: 'EUR', symbol: '€' },
  { name: 'Israel', code: 'IL', phoneCode: '+972', currency: 'ILS', symbol: '₪' },
  { name: 'Italy', code: 'IT', phoneCode: '+39', currency: 'EUR', symbol: '€' },
  { name: 'Japan', code: 'JP', phoneCode: '+81', currency: 'JPY', symbol: '¥' },
  { name: 'Malaysia', code: 'MY', phoneCode: '+60', currency: 'MYR', symbol: 'RM' },
  { name: 'Mexico', code: 'MX', phoneCode: '+52', currency: 'MXN', symbol: '$' },
  { name: 'Netherlands', code: 'NL', phoneCode: '+31', currency: 'EUR', symbol: '€' },
  { name: 'New Zealand', code: 'NZ', phoneCode: '+64', currency: 'NZD', symbol: '$' },
  { name: 'Norway', code: 'NO', phoneCode: '+47', currency: 'NOK', symbol: 'kr' },
  { name: 'Pakistan', code: 'PK', phoneCode: '+92', currency: 'PKR', symbol: '₨' },
  { name: 'Philippines', code: 'PH', phoneCode: '+63', currency: 'PHP', symbol: '₱' },
  { name: 'Poland', code: 'PL', phoneCode: '+48', currency: 'PLN', symbol: 'zł' },
  { name: 'Portugal', code: 'PT', phoneCode: '+351', currency: 'EUR', symbol: '€' },
  { name: 'Russia', code: 'RU', phoneCode: '+7', currency: 'RUB', symbol: '₽' },
  { name: 'Saudi Arabia', code: 'SA', phoneCode: '+966', currency: 'SAR', symbol: '﷼' },
  { name: 'Singapore', code: 'SG', phoneCode: '+65', currency: 'SGD', symbol: '$' },
  { name: 'South Africa', code: 'ZA', phoneCode: '+27', currency: 'ZAR', symbol: 'R' },
  { name: 'South Korea', code: 'KR', phoneCode: '+82', currency: 'KRW', symbol: '₩' },
  { name: 'Spain', code: 'ES', phoneCode: '+34', currency: 'EUR', symbol: '€' },
  { name: 'Sweden', code: 'SE', phoneCode: '+46', currency: 'SEK', symbol: 'kr' },
  { name: 'Switzerland', code: 'CH', phoneCode: '+41', currency: 'CHF', symbol: 'Fr' },
  { name: 'Taiwan', code: 'TW', phoneCode: '+886', currency: 'TWD', symbol: 'NT$' },
  { name: 'Thailand', code: 'TH', phoneCode: '+66', currency: 'THB', symbol: '฿' },
  { name: 'Turkey', code: 'TR', phoneCode: '+90', currency: 'TRY', symbol: '₺' },
  { name: 'United Arab Emirates', code: 'AE', phoneCode: '+971', currency: 'AED', symbol: 'د.إ' },
  { name: 'United Kingdom', code: 'GB', phoneCode: '+44', currency: 'GBP', symbol: '£' },
  { name: 'United States', code: 'US', phoneCode: '+1', currency: 'USD', symbol: '$' },
  { name: 'Vietnam', code: 'VN', phoneCode: '+84', currency: 'VND', symbol: '₫' },
].sort((a, b) => a.name.localeCompare(b.name));

export function formatPhoneNumber(phoneNumber: string, countryCode: string): string {
  const digits = phoneNumber.replace(/\D/g, '');
  let formatted = '';

  switch (countryCode) {
    case 'US':
    case 'CA':
      // Format: (XXX) XXX-XXXX
      if (digits.length <= 3) {
        formatted = digits;
      } else if (digits.length <= 6) {
        formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      } else {
        formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
      }
      break;
    case 'GB':
      // Format: XXXX XXX XXX
      if (digits.length <= 4) {
        formatted = digits;
      } else if (digits.length <= 7) {
        formatted = `${digits.slice(0, 4)} ${digits.slice(4)}`;
      } else {
        formatted = `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
      }
      break;
    case 'IN':
      // Format: XXXXX XXXXX
      if (digits.length <= 5) {
        formatted = digits;
      } else {
        formatted = `${digits.slice(0, 5)} ${digits.slice(5, 10)}`;
      }
      break;
    default:
      // Default format: Groups of 3-4 digits
      formatted = digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
  }

  return formatted;
}