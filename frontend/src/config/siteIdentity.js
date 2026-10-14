/**
 * ============================================================
 *  साइट पहिचान (identity) — यही एउटै ठाउँमा सबै नाम/इमेल/कपीराइट
 * ============================================================
 *
 *  पहिले नाम-इमेल छरिएर थियो :
 *    · FooterBottom.jsx  → कपीराइट + कम्पनीको नाम
 *    · backend/.env      → EMAIL_USER
 *    · git config        → user.name / user.email
 *    · DB को team तालिका → team मेम्बर
 *
 *  अब **कोडभित्रको** सबै कुरा यहाँबाट लिन्छ।
 *  नाम वा इमेल बदल्न यही मात्र सम्हाल्नुहोस् — अरू सबै आफैँ बदलिन्छ।
 *
 *  ⚠ डाटाबेस (team तालिका) र backend/.env *डाटा* हुन — ती यहाँबाट
 *    बदलिँदैनन्। तिनलाई एडमिन प्यानल वा .env फाइलबाट बदल्नुहोस्।
 */

export const SITE_IDENTITY = {
  /** कपीराइटमा देखिने प्रकाशक/स्वामी नाम */
  owner: "Abhishek Rajbanshi",

  /** फुटरको "Powered by" मा देखिने कम्पनी/ब्र्यान्ड */
  company: "Nagarika News",

  /** कपीराइट वर्ष — विक्रम सम्वत् (०००० = सधैँ चल्ने) */
  bsYear: "२०८३",

  /** सम्पर्क इमेल — फुटरमा देखिन्छ */
  email: "abhishekrajbanshi999@gmail.com",

  /** आधिकारिक वेबसाइट */
  website: "https://nagarikjagaran.com",

  /** स्रोतको रिपोजिटरी (Powered by लिंक) */
  creditUrl: "https://www.zeroinfinitytechnologies.com",
  creditLabel: "zeroinfinitytechnologies.com",
};

/** फुटरमा देख्ने पूरा कपीराइट लाइन */
export const copyrightLine = (year) =>
  `© ${year || SITE_IDENTITY.bsYear} ${SITE_IDENTITY.company}। सर्वाधिकार सुरक्षित।`;

export default SITE_IDENTITY;
