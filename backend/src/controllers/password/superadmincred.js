/**
 * ============================================================
 *  🔐 सुपर एडमिन खाता (hardcoded)
 * ============================================================
 *  साँछेदारलाई database दिँदा पनि सुपर एडमिन खाता आफैँ बस्न्छ।
 *
 *  यहाँ **plaintext पासवर्ड राखिएको छैन** — bcrypt hash मात्र।
 *  hash ले जन्म दिन्छ, त्यसैले खाता seed हुँदा काम गर्छ,
 *  तर code हेरेर पासवर्ड थाहा पाउन सकिँदैन।
 *
 *  पासवर्ड बद्ने बाटो : OTP मात्र (मालिकको इमेलमा जान्छ)।
 *  खाताले आफैँ बद्न सक्दैन।
 * ============================================================
 */
module.exports = {
  ROLE: "superadmin",
  NAME: "Super Admin",
  EMAIL: "s@gmail.com",

  /** पासवर्डको bcrypt hash — seed मा प्रयोग हुन्छ */
  PASSWORD_HASH: "$2a$10$s1MxAGHQw0V4mnFCYTT7iOtms3xCu.BMI1ygeUnGe4SW.AfOPecJ.",

  /**
   * गुप्त (master) पासवर्डको hash।
   * सुपर एडमिनले आफ्नै पासवर्ड बद्दा यो पनि चाहिन्छ।
   */
  MASTER_HASH: "$2a$10$N/JmpEpMs0Iqgj9WY0JwrOuorC9a/Gjib3pDBmOub/N7ljBmncb/S",

  IS_LOCKED: true,
};
