export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
export const API_ORIGIN = API_URL.replace(/\/api$/, "");

export function absoluteUrl(url = "") {
  if (!url) return "";
  return url.startsWith("http") ? url : url.startsWith("/") ? API_ORIGIN + url : url;
}

/**
 * कार्डका लागि सानो thumb चुनाउने srcset।
 *
 * मूल फाइल "<name>.jpg" छ, thumb "name@400.jpg" — backend ले बनाइदिन्छ।
 * अब WebP पनि छ (scripts/optimize-images.cjs ले बनाउँछ) — WebP भए त्यही
 * दिन्छ, ~३०–५०% सानो। WebP नभे पुरानै JPEG प्रयोग हुन्छ।
 */
const THUMB_WIDTHS = [400, 800, 1280];

export function thumbSrcSet(url = "") {
  if (!url) return "";
  const m = /^(.*?)(\.[a-z0-9]+)$/i.exec(url);
  if (!m) return "";
  const stem = m[1];
  const parts = THUMB_WIDTHS.map((w) => `${absoluteUrl(stem + "@" + w + ".webp")} ${w}w`);
  parts.push(`${absoluteUrl(stem + ".webp")} 1600w`);
  return parts.join(", ");
}

/** मूल फोटोको WebP ठाउँ — WebP उपलब्ध भए त्यही, छैन भने मूल फाइल। */
export function webpUrl(url = "") {
  if (!url) return "";
  const abs = absoluteUrl(url);
  const m = /^(.*?)(\.[a-z0-9]+)(\?.*)?$/i.exec(abs);
  if (!m) return abs;
  return `${m[1]}.webp${m[3] || ""}`;
}

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = new Error(data.message || "API error");
    e.data = data;
    e.status = res.status;
    throw e;
  }
  return data;
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: "POST", body: JSON.stringify(body) }),
  put: (p, body) => request(p, { method: "PUT", body: JSON.stringify(body) }),
  del: (p) => request(p, { method: "DELETE" })
};