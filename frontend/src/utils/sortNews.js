/**
 * नयाँ समाचार माथि — पहिले हालेको पहिले।
 *
 * मुख्य क्रम : created_at DESC (नयाँ हालेको)
 * बराबरीमा : id DESC (पुरानो id भन्दा नयाँ id)
 *
 * नोट :
 *  - `date` फिल्डमा नेपाली मिति (जस्तै "२४ असोज २०८३") स्ट्रिङ हुन्छ, त्यो
 *    मिलाउन मिल्दैन — त्यसैले created_at प्रयोग गरिएको छ।
 *  - newsService ले created_at लाई पहिले नै JS Date मा बदलिदिन्छ, त्यसैले
 *    यहाँ Date instance र स्ट्रिङ दुवै सँगै काम गर्ने सहायक छ।
 */
const toTime = (v) => {
  if (!v) return 0;
  if (v instanceof Date) return v.getTime();
  const t = Date.parse(v);
  return Number.isNaN(t) ? 0 : t;
};

export const newestFirst = (list = []) =>
  [...(Array.isArray(list) ? list : [])].sort((a, b) => {
    const ta = toTime(a.created_at);
    const tb = toTime(b.created_at);
    if (tb !== ta) return tb - ta;
    return Number(b.id) - Number(a.id);
  });

export default newestFirst;