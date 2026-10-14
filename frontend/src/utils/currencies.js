/**
 * मुद्रा रूपान्तरण — अनलाइन दर नभएकाले यी "सन्दर्भ दर" (reference rate) हुन्।
 * प्रयोगकर्ताले कुनै पनि दर आफैं टाइप गरी सक्छन्।
 * १ USD = X मुद्रा (approx, mid-market)
 */
export const CURRENCIES = [
  { code: "NPR", name: "नेपाली रुपैयाँ", nameEn: "Nepalese Rupee", perUsd: 133.5, flag: "ने" },
  { code: "USD", name: "अमेरिकी डलर", nameEn: "US Dollar", perUsd: 1, flag: "$" },
  { code: "INR", name: "भारतीय रुपैयाँ", nameEn: "Indian Rupee", perUsd: 83.4, flag: "₹" },
  { code: "EUR", name: "युरो", nameEn: "Euro", perUsd: 0.92, flag: "€" },
  { code: "GBP", name: "ब्रिटिश पाउन्ड", nameEn: "British Pound", perUsd: 0.79, flag: "£" },
  { code: "AUD", name: "अस्ट्रेलियन डलर", nameEn: "Australian Dollar", perUsd: 1.52, flag: "A$" },
  { code: "CAD", name: "क्यानडियन डलर", nameEn: "Canadian Dollar", perUsd: 1.37, flag: "C$" },
  { code: "JPY", name: "जापानी येन", nameEn: "Japanese Yen", perUsd: 152.0, flag: "¥" },
  { code: "CNY", name: "चिनी युयान", nameEn: "Chinese Yuan", perUsd: 7.24, flag: "¥" },
  { code: "KRW", name: "दक्षिण कोरियन वोन", nameEn: "South Korean Won", perUsd: 1345.0, flag: "₩" },
  { code: "SGD", name: "सिङ्गापुर डलर", nameEn: "Singapore Dollar", perUsd: 1.34, flag: "S$" },
  { code: "HKD", name: "हङ्काङ डलर", nameEn: "Hong Kong Dollar", perUsd: 7.81, flag: "HK$" },
  { code: "THB", name: "थाईल्याण्ड बाट", nameEn: "Thai Baht", perUsd: 35.4, flag: "฿" },
  { code: "MYR", name: "मलेसियन रिङ्गिट", nameEn: "Malaysian Ringgit", perUsd: 4.71, flag: "RM" },
  { code: "IDR", name: "इण्डोनेशियन रुपिया", nameEn: "Indonesian Rupiah", perUsd: 15850.0, flag: "Rp" },
  { code: "VND", name: "भियतनामी डाङ", nameEn: "Vietnamese Dong", perUsd: 25100.0, flag: "₫" },
  { code: "AED", name: "युएई दिरहम", nameEn: "UAE Dirham", perUsd: 3.67, flag: "د.إ" },
  { code: "SAR", name: "साउदी रियाल", nameEn: "Saudi Riyal", perUsd: 3.75, flag: "﷼" },
  { code: "LKR", name: "श्रीलङ्का रुपिया", nameEn: "Sri Lankan Rupee", perUsd: 296.0, flag: "Rs" },
  { code: "PKR", name: "पाकिस्तानी रुपिया", nameEn: "Pakistani Rupee", perUsd: 278.0, flag: "₨" }
];

export const byCode = (code) => CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];

/** amount * from → to */
export const convert = (amount, fromCode, toCode) => {
  const from = byCode(fromCode);
  const to = byCode(toCode);
  const n = Number(amount);
  if (!Number.isFinite(n) || from.perUsd === 0) return 0;
  return (n / from.perUsd) * to.perUsd;
};

/** मुद्रा नाम छट्याउने साहायक (खोज) */
export const searchCurrencies = (q) => {
  const s = String(q || "").trim().toLowerCase();
  if (!s) return CURRENCIES;
  return CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(s) ||
      c.name.includes(s) ||
      c.nameEn.toLowerCase().includes(s)
  );
};
