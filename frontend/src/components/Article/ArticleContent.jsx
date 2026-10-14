import React from "react";
import { absoluteUrl } from "../../services/api";
import { stripComments } from "../../utils/cleanHtml";
import Watermark from "../Common/Watermark";
import AdSlot from "../Ads/AdSlot";

const VOID_TAGS = new Set(["BR", "IMG", "HR", "INPUT", "META", "LINK", "SOURCE"]);

/* पहिलो अक्षरको रङ — समाचार अनुसार स्वतः फेरिन्छ (क्रम फिक्स, id मा आधारित) */
const DROP_COLORS = ["#dc2626", "#16a34a", "#2563eb", "#7c3aed", "#db2777", "#ea580c", "#0ea5e9", "#8d3b2d", "#64748b"];

const attrsOf = (el) => {
  if (!el.hasAttributes()) return "";
  let s = "";
  Array.from(el.attributes).forEach((a) => {
    if (a.name === "contenteditable" || a.name === "data-fancybox") return;
    s += " " + a.name + (a.value !== "" ? `="${String(a.value).replace(/"/g, "&quot;")}"` : "");
  });
  return s;
};

const parseHtml = (html) => {
  const div = document.createElement("div");
  div.innerHTML = html;
  const photos = [];
  const toMarker = (node, kind, dataAd = "") => {
    const marker = document.createElement("span");
    marker.className = "slot-marker";
    marker.setAttribute("data-kind", kind);
    if (kind === "photo") {
      photos.push(node.tagName === "IMG" ? (node.getAttribute("src") || "") : (node.getAttribute("src") || ""));
      marker.setAttribute("data-i", String(photos.length - 1));
    } else {
      marker.setAttribute("data-ad", dataAd);
    }
    const wrap = node.closest && node.closest(".mini-wrap");
    if (wrap) wrap.replaceWith(marker);
    else node.replaceWith(marker);
  };

  div.querySelectorAll(".ad-marker[data-ad]").forEach((m) => toMarker(m, "ad", m.getAttribute("data-ad")));
  div.querySelectorAll("img").forEach((img) => toMarker(img, "photo"));

  const items = [];
  let buff = "";
  const flush = () => {
    if (buff.trim()) items.push({ kind: "html", value: buff });
    buff = "";
  };
  const walk = (node) => {
    if (node.nodeType === 3) { buff += node.nodeValue; return; }
    if (node.nodeType !== 1) return;
    if (node.classList && node.classList.contains("slot-marker")) {
      flush();
      if (node.getAttribute("data-kind") === "photo") {
        items.push({ kind: "photo", value: photos[Number(node.getAttribute("data-i"))] || "" });
      } else {
        items.push({ kind: "ad", value: node.getAttribute("data-ad") || "" });
      }
      return;
    }
    const tag = node.tagName.toLowerCase();
    if (VOID_TAGS.has(node.tagName)) { buff += `<${tag}${attrsOf(node)}/>`; return; }
    buff += `<${tag}${attrsOf(node)}>`;
    Array.from(node.childNodes).forEach(walk);
    buff += `</${tag}>`;
  };
  Array.from(div.childNodes).forEach(walk);
  flush();
  return items;
};

const placeMiddleAd = (arr) => {
  if (arr.some((it) => it.kind === "ad" && it.value === "article-middle")) return arr;
  const total = arr.reduce((s, it) => s + (it.kind === "html" ? it.value.length : 0), 0);
  if (total < 200) return arr;

  let acc = 0;
  let idx = -1;
  for (let i = 0; i < arr.length; i += 1) {
    const it = arr[i];
    if (it.kind !== "html") continue;
    acc += it.value.length;
    if (acc >= total / 2) { idx = i; break; }
  }
  if (idx < 0) return arr;

  const target = arr[idx].value;
  const local = (total / 2) - (acc - target.length);
  let pos = target.lastIndexOf("</p>", local);
  if (pos < 0 || pos < local - 1200) {
    const next = target.indexOf("</p>", local);
    pos = next;
  }
  if (pos < 0) {
    return [...arr.slice(0, idx + 1), { kind: "ad", value: "article-middle" }, ...arr.slice(idx + 1)];
  }
  pos += 4;
  return [
    ...arr.slice(0, idx),
    { kind: "html", value: target.slice(0, pos) },
    { kind: "ad", value: "article-middle" },
    { kind: "html", value: target.slice(pos) },
    ...arr.slice(idx + 1)
  ];
};

export default function ArticleContent({ article, fontSize = 19 }) {
  // डाटाबेसमा पुरानो <!--StartFragment--> जस्ता टिप्पणी भए पनि नदेखाउने
  const raw = stripComments(article.content || "");
  const isHtml = /<[a-z][\s\S]*>/i.test(raw);
  let items = [];
  if (!raw) {
    items = [];
  } else if (!isHtml) {
    items = raw.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => ({ kind: "html", value: l, plain: true }));
  } else {
    items = parseHtml(raw);
  }
  items = placeMiddleAd(items);

  /* पहिलो अक्षर (drop cap) भएको ब्लक — प्रत्येक समाचारमा फरक रङ */
  const leadIndex = items.findIndex((it) => it.kind === "html");
  const dropColor = DROP_COLORS[Math.abs(Number(article.id) || 0) % DROP_COLORS.length];

  return (
    <div className="article-content" style={{ fontSize: fontSize + "px" }}>
      {items.map((it, i) => {
        if (it.kind === "photo") {
          return it.value ? (
            <span key={i} className="article-photo-wrap">
              <img
                src={absoluteUrl(it.value)}
                alt=""
                className="article-photo-thumb"
              />
              <Watermark />
            </span>
          ) : null;
        }
        if (it.kind === "ad") {
          return (
            <div key={i} className="my-6">
              <AdSlot position={it.value} />
            </div>
          );
        }
        const isLead = i === leadIndex;
        return (
          <div
            key={i}
            className={isLead ? "article-lead" : undefined}
            style={isLead ? { fontSize: fontSize + "px", "--drop-color": dropColor } : { fontSize: fontSize + "px" }}
          >
            {it.plain ? <p>{it.value}</p> : <div dangerouslySetInnerHTML={{ __html: it.value }} />}
          </div>
        );
      })}
    </div>
  );
}