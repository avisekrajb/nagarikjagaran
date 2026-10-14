import React, { useEffect, useRef, useState } from "react";
import {
  Droplets, Save, RefreshCw, Power, Square, Circle, RectangleHorizontal,
    Move, ImageOff, CheckCircle2, Play
  } from "lucide-react";
import { adminApi } from "../../../services/adminApi";
import { absoluteUrl } from "../../../services/api";
import { getAllNews } from "../../../services/newsService";
import { clearWatermarkCache } from "../../../components/Common/Watermark";
import { Btn } from "./AdminUI";

const SHAPES = [
  { key: "square", label: "चौकोर", Icon: Square },
  { key: "rounded", label: "राउन्डेड", Icon: RectangleHorizontal },
  { key: "circle", label: "गोलो", Icon: Circle }
];

const Slider = ({ label, value, min, max, step = 1, unit = "", onChange }) => (
  <label className="block">
    <span className="mb-1.5 flex items-center justify-between text-sm font-bold text-slate-600">
      {label}
      <b className="rounded-lg bg-blue-50 px-2 py-0.5 text-xs tabular-nums text-blue-700">
        {value}{unit}
      </b>
    </span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full cursor-pointer accent-blue-600"
    />
  </label>
);

export default function AdminWatermark({ setMsg }) {
  const [f, setF] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState("");
  const stageRef = useRef(null);
  const dragRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      setF(await adminApi.getWatermark());
    } catch (e) {
      setMsg("Watermark सेटिङ लोड हुन सकेन: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  // preview को लागि एउटा वास्तविक फोटो
  useEffect(() => {
    getAllNews()
      .then((rows) => {
        const withImg = rows.find((r) => r && r.image);
        setPhoto(withImg ? withImg.image : "");
      })
      .catch(() => setPhoto(""));
  }, []);

  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  /* ---------------- drag : preview भित्र नै logo सार्ने ---------------- */
  const onPointerDown = (e) => {
    if (!stageRef.current) return;
    e.preventDefault();
    dragRef.current = { moved: false };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragRef.current || !stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const x = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100));
    dragRef.current.moved = true;
    setF((s) => ({ ...s, pos_x: Math.round(x * 10) / 10, pos_y: Math.round(y * 10) / 10 }));
  };

  const onPointerUp = () => { dragRef.current = null; };

  const nudge = (dx, dy) => setF((s) => ({
    ...s,
    pos_x: Math.min(100, Math.max(0, Math.round((s.pos_x + dx) * 10) / 10)),
    pos_y: Math.min(100, Math.max(0, Math.round((s.pos_y + dy) * 10) / 10))
  }));

  const save = async () => {
    setSaving(true);
    try {
      const saved = await adminApi.updateWatermark(f);
      setF(saved);
      clearWatermarkCache();           // अर्को पटक नयाँ डाटा लिन
      setMsg("Watermark बचत भयो — अब समाचार पेजमा देखिनेछ");
    } catch (e) {
      setMsg(e.message || "बच्न सकिएन");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !f) {
    return <p className="py-10 text-center text-sm font-bold text-slate-400">लोड हुँदैछ...</p>;
  }

  const previewSize = Math.max(40, Math.min(200, Number(f.size)));

  return (
    <div className="space-y-5">
      {/* शीर्षक */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-black text-slate-800">
            <Droplets size={20} className="text-blue-600" /> Watermark व्यवस्थापन
          </h2>
          <p className="mt-0.5 text-xs font-bold text-slate-500">
            समाचारको मुख्य फोटो र भित्रका सबै फोटोमा लोगो छापिनेछ
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn kind="soft" onClick={load} disabled={loading}>
            <RefreshCw size={15} /> रिफ्रेस
          </Btn>
          <Btn onClick={save} disabled={saving}>
            <Save size={15} /> {saving ? "बच्दै..." : "बचाउनुहोस्"}
          </Btn>
        </div>
      </div>

      {/* सक्रिय / निष्क्रिय */}
      <button
        onClick={() => set("enabled", !f.enabled)}
        className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
          f.enabled ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"
        }`}
      >
        <span>
          <b className="flex items-center gap-2 text-sm font-black text-slate-800">
            {f.enabled
              ? <CheckCircle2 size={16} className="text-emerald-600" />
              : <ImageOff size={16} className="text-slate-400" />}
            Watermark {f.enabled ? "देखिन्छ" : "लुकाइएको"}
          </b>
          <small className="mt-0.5 block text-[11px] font-bold text-slate-500">
            {f.enabled ? "फोटोमा लोगो छापिनेछ" : "कुनै फोटोमा पनि देखिनेछैन"}
          </small>
        </span>
        <span className={`grid h-8 w-14 flex-none items-center rounded-full px-1 transition ${
          f.enabled ? "bg-emerald-500" : "bg-slate-300"
        }`}>
          <span className={`h-6 w-6 rounded-full bg-white shadow transition-transform ${
            f.enabled ? "translate-x-6" : ""
          }`} />
        </span>
      </button>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ---------------- रील/भिडियो watermark ---------------- */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-700">
            <Play size={15} className="text-blue-600" /> रील / भिडियो watermark
          </h3>

          <button
            onClick={() => set("reel_enabled", !f.reel_enabled)}
            className={`mb-4 flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left transition ${
              f.reel_enabled ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"
            }`}
          >
            <b className="text-sm font-black text-slate-800">
              भिडियोमा {f.reel_enabled ? "देखिन्छ" : "लुकाइएको"}
            </b>
            <span className={`grid h-7 w-12 flex-none items-center rounded-full px-1 transition ${
              f.reel_enabled ? "bg-emerald-500" : "bg-slate-300"
            }`}>
              <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                f.reel_enabled ? "translate-x-5" : ""
              }`} />
            </span>
          </button>

          {/* ९:१६ preview — drag गरेर स्थान मिलाउने */}
          <div
            className="relative mx-auto grid aspect-[9/16] w-full max-w-[220px] place-items-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-900"
            style={{ touchAction: "none", cursor: "grab" }}
            onPointerDown={(e) => {
              e.preventDefault();
              const box = e.currentTarget.getBoundingClientRect();
              if (!box.width || !box.height) return;
              e.currentTarget.setPointerCapture?.(e.pointerId);
              const move = (ev) => {
                const x = Math.min(100, Math.max(0, ((ev.clientX - box.left) / box.width) * 100));
                const y = Math.min(100, Math.max(0, ((ev.clientY - box.top) / box.height) * 100));
                setF((s) => ({ ...s, reel_pos_x: Math.round(x * 10) / 10, reel_pos_y: Math.round(y * 10) / 10 }));
              };
              const up = () => {
                e.currentTarget.removeEventListener("pointermove", move);
                e.currentTarget.removeEventListener("pointerup", up);
              };
              e.currentTarget.addEventListener("pointermove", move);
              e.currentTarget.addEventListener("pointerup", up);
              move(e);
            }}
          >
            <span className="pointer-events-none absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
                backgroundSize: "10% 10%"
              }}
            />
            <span className="pointer-events-none absolute inset-x-3 bottom-4 h-16 rounded bg-gradient-to-t from-black/70 to-transparent" />

            <span
              className="absolute z-10 grid place-items-center rounded bg-white/92 shadow-lg"
              style={{
                left: `${Number(f.reel_pos_x)}%`,
                top: `${Number(f.reel_pos_y)}%`,
                width: Math.max(14, Number(f.reel_size) || 34),
                height: Math.max(14, Number(f.reel_size) || 34),
                transform: "translate(-50%,-50%)",
                opacity: Number(f.reel_opacity),
                outline: "2px dashed rgba(37,99,235,.85)",
                outlineOffset: 2
              }}
            >
              {f.logo
                ? <img src={absoluteUrl(f.logo)} alt="" className="h-full w-full object-contain p-1" />
                : <span className="text-sm font-black text-blue-700">न</span>}
            </span>

            <span className="pointer-events-none absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-black tabular-nums text-white">
              X {Number(f.reel_pos_x).toFixed(1)}% · Y {Number(f.reel_pos_y).toFixed(1)}%
            </span>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-slate-400">
                आकार (px)
              </span>
              <input
                type="number" min="14" max="200"
                value={f.reel_size}
                onChange={(e) => set("reel_size", Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-slate-400">
                पारदर्शिता
              </span>
              <input
                type="range" min="0.05" max="1" step="0.05"
                value={f.reel_opacity}
                onChange={(e) => set("reel_opacity", Number(e.target.value))}
                className="w-full"
              />
            </label>
          </div>
        </section>

        {/* ---------------- preview (drag यहाँ) ---------------- */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-700">
            <Move size={15} className="text-blue-600" /> preview — logo तान्नुहोस्
          </h3>

          <div
            ref={stageRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{ touchAction: "none", cursor: "grab" }}
            className="relative grid aspect-[16/10] w-full place-items-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-900"
          >
            {photo ? (
              <img src={absoluteUrl(photo)} alt="" className="h-full w-full object-cover opacity-85" />
            ) : (
              <span className="text-sm font-bold text-white/50">
                फोटो नभए पनि watermark को स्थान देख्न सकिन्छ
              </span>
            )}

            {/* skeleton grid — स्थान मिलाउन सजिलो */}
            <span className="pointer-events-none absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
                backgroundSize: "10% 10%"
              }}
            />

            {/* draggable watermark */}
            <span
              className={`absolute z-10 grid place-items-center shadow-lg ${
                f.shape === "circle" ? "rounded-full"
                  : f.shape === "square" ? "rounded-none" : "rounded-2xl"
              }`}
              style={{
                left: `${f.pos_x}%`,
                top: `${f.pos_y}%`,
                width: previewSize,
                height: previewSize,
                transform: "translate(-50%,-50%)",
                opacity: f.opacity,
                background: f.bg_color,
                outline: "2px dashed rgba(37,99,235,.85)",
                outlineOffset: 3
              }}
            >
              {f.logo
                ? <img src={absoluteUrl(f.logo)} alt="" className="h-full w-full object-contain p-1.5" />
                : <span className="text-2xl font-black text-blue-700">न</span>}
            </span>

            <span className="pointer-events-none absolute bottom-2 left-2 rounded-lg bg-black/55 px-2 py-1 text-[10px] font-black tabular-nums text-white">
              X {Number(f.pos_x).toFixed(1)}% · Y {Number(f.pos_y).toFixed(1)}%
            </span>
          </div>

          {/* छिटो मिलाउन */}
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {[["बायाँ माथि", 12, 12], ["माथि", 50, 12], ["दायाँ माथि", 88, 12],
              ["बायाँ", 12, 50], ["बीच", 50, 50], ["दायाँ", 88, 50],
              ["बायाँ तल", 12, 88], ["तल", 50, 88], ["दायाँ तल", 88, 88]].map(([l, x, y]) => (
              <button
                key={l}
                onClick={() => setF((s) => ({ ...s, pos_x: x, pos_y: y }))}
                className="rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] font-black text-slate-600 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
              >
                {l}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              सानो सार्नुहोस्
            </span>
            {[[-1, 0], [1, 0], [0, -1], [0, 1]].map(([dx, dy], i) => (
              <button
                key={i}
                onClick={() => nudge(dx * 0.5, dy * 0.5)}
                className="h-8 w-8 rounded-lg border border-slate-200 text-sm font-black text-slate-600 transition hover:border-blue-400 hover:bg-blue-50"
              >
                {dx === -1 ? "←" : dx === 1 ? "→" : dy === -1 ? "↑" : "↓"}
              </button>
            ))}
          </div>
        </section>

        {/* ---------------- नियन्त्रण ---------------- */}
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:p-5">
          <div>
            <span className="mb-1.5 block text-sm font-bold text-slate-600">आकार (shape)</span>
            <div className="grid grid-cols-3 gap-2">
              {SHAPES.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => set("shape", key)}
                  className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-[11px] font-black transition ${
                    f.shape === key
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <Slider label="साइज" value={Number(f.size)} min={40} max={400} unit="px"
            onChange={(v) => set("size", v)} />

          <Slider label="पारदर्शिता (opacity)" value={Number(f.opacity)} min={5} max={100} unit="%"
            onChange={(v) => set("opacity", v / 100)} />

          <Slider label="घुमाउन (rotate)" value={Number(f.rotation)} min={-180} max={180} unit="°"
            onChange={(v) => set("rotation", v)} />

          <Slider label="माथिल्लो स्थान" value={Number(f.pos_y)} min={0} max={100} unit="%"
            onChange={(v) => set("pos_y", v)} />

          <Slider label="बायाँ स्थान" value={Number(f.pos_x)} min={0} max={100} unit="%"
            onChange={(v) => set("pos_x", v)} />

          <div>
            <span className="mb-1.5 block text-sm font-bold text-slate-600">पृष्ठभूमिको रङ</span>
            <div className="flex flex-wrap gap-2">
              {["#ffffff", "#000000", "#fde047", "#dc2626", "#2563eb"].map((c) => (
                <button
                  key={c}
                  onClick={() => set("bg_color", c)}
                  style={{ background: c }}
                  className={`h-9 w-9 rounded-xl ring-offset-2 transition ${
                    f.bg_color === c ? "ring-2 ring-blue-600" : "ring-1 ring-slate-300"
                  }`}
                  aria-label={`रङ ${c}`}
                />
              ))}
              <input
                type="color"
                value={f.bg_color || "#ffffff"}
                onChange={(e) => set("bg_color", e.target.value)}
                className="h-9 w-14 cursor-pointer rounded-xl border border-slate-200 bg-white"
                aria-label="आफ्नो रङ"
              />
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 px-3 py-2.5 text-[11px] font-bold leading-relaxed text-slate-500">
            लोगो खाली भए साइटको हेडर लोगो प्रयोग हुन्छ। फुटर व्यवस्थापनबाट
            लोगो बदलिए यहाँ पनि बदलिन्छ।
          </div>
        </section>
      </div>
    </div>
  );
}
