/**
 * सानो in-memory TTL cache (Redis बिना)।
 *
 * मात्र GET/पब्लिक endpoint हरूका लागि — कुनै पनि write (POST/PUT/DELETE)
 * ले सम्बन्धित key हटाउँछ, त्यसैले एडमिनले केही बदले तुरुन्तै देखिन्छ।
 */
const store = new Map();

/** key -> { value, expires } */
function get(key) {
  const hit = store.get(key);
  if (!hit) return undefined;
  if (Date.now() > hit.expires) {
    store.delete(key);
    return undefined;
  }
  return hit.value;
}

function set(key, value, ttlMs) {
  store.set(key, { value, expires: Date.now() + ttlMs });
  /* अत्यधिक धेरै key नजागा */
  if (store.size > 500) {
    const oldest = [...store.entries()].sort((a, b) => a[1].expires - b[1].expires);
    oldest.slice(0, 100).forEach(([k]) => store.delete(k));
  }
}

/** prefix सँग मिल्ने सबै key हटाउने (जस्तै "news:*") */
function invalidate(prefix) {
  let n = 0;
  for (const k of [...store.keys()]) {
    if (k.startsWith(prefix)) {
      store.delete(k);
      n += 1;
    }
  }
  return n;
}

/** node --check दिएको module-level TTL प्रयोग गर्ने helper */
const cached = (key, ttlMs, producer) => async (...args) => {
  const full = typeof key === "function" ? key(...args) : key;
  const hit = get(full);
  if (hit !== undefined) return hit;
  const value = await producer(...args);
  set(full, value, ttlMs);
  return value;
};

const S = (n) => n * 1000;

module.exports = { get, set, invalidate, cached, S };
