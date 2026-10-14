/**
 * ब्राउजरले paste गर्दा HTML मा <!--StartFragment--> / <!--EndFragment-->
 * जस्ता लुकेरा टिप्पणी थप्छ, जसले समाचारको सारांशमा कच्चा ट्याग देखिन्छ।
 */

const FRAGMENT = /<!--\s*\/?\s*(Start|End)Fragment\s*-->/gi;

/** लुकेरा टिप्पणी हटाउने — अन्य टिप्पणी छुट्दैन */
export const stripFragments = (html = "") =>
  String(html).replace(FRAGMENT, "");

/** सबै HTML टिप्पणी हटाउने (पेसमा आएका अनावश्यक टिप्पणी पनि) */
export const stripComments = (html = "") =>
  String(html).replace(/<!--[\s\S]*?-->/g, "");

/** HTML लाई सादा पाठमा बदल्ने — सारांश बनाउँदा प्रयोग हुन्छ */
export const htmlToText = (html = "") => {
  const withBreaks = stripFragments(html)
    .replace(/<\s*br\s*\/?>/gi, " ")
    .replace(/<\/\s*(p|div|h[1-6]|li|tr)\s*>/gi, " ")
    .replace(/<[^>]*>/g, "");
  return withBreaks
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
};

/** पेस गरिएको HTML बाट सुरक्षित, सफा HTML */
export const cleanPastedHtml = (html = "") =>
  stripComments(
    String(html)
      .replace(/<(script|style|iframe|object|embed|noscript)[\s\S]*?<\/\1>/gi, "")
      .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .replace(/(href|src)\s*=\s*("javascript:[^"]*"|'javascript:[^']*')/gi, "")
  );

/**
 * नयाँ टिप्पणी हटाउनुहोस् — `value` भित्र छुटेको भए मात्र
 */
export const cleanIfNeeded = (html = "") => {
  const before = String(html);
  const after = stripFragments(stripComments(before));
  return after === before ? before : after;
};
