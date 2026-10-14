import React, { useEffect, useState } from "react";
import { ImagePlus, Save, Trash2, Loader2 } from "lucide-react";
import { adminApi } from "../../../services/adminApi";
import { absoluteUrl } from "../../../services/api";
import { Btn, ImagePicker } from "./AdminUI";

export default function AdminHeaderPhoto({ setMsg }) {
  const [photo, setPhoto] = useState("");
  const [file, setFile] = useState(null);
  const [prev, setPrev] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const d = await adminApi.getHeaderPhoto();
      setPhoto((d && d.photo) || "");
    } catch (e) { setMsg(e.message); }
  };
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    if (!file) { setMsg("फोटो चयन गर्नुहोस् — हेडरमा देखिने फोटो अपलोड गर्नुहोस्"); return; }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("category", "header");
      fd.append("image", file);
      await adminApi.updateHeaderPhoto(fd);
      setFile(null);
      setPrev("");
      setMsg("हेडर फोटो अपडेट भयो — मौसम/मिति लुकेर फोटो देखिनेछ");
      load();
    } catch (err) { setMsg(err.message); }
    setBusy(false);
  };

  const remove = async () => {
    if (!photo) return;
    if (!window.confirm("हेडर फोटो हटाएर मौसम + मिति/समय फिर्ता ल्याउने हो?")) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("category", "header");
      fd.append("imageUrl", "");
      await adminApi.updateHeaderPhoto(fd);
      setPhoto("");
      setFile(null);
      setPrev("");
      setMsg("हेडर फोटो हटाइयो — मौसम र मिति/समय देखिनेछन्");
      load();
    } catch (err) { setMsg(err.message); }
    setBusy(false);
  };

  const effective = prev || photo;

  return (
    <form onSubmit={save} className="max-w-4xl space-y-5">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-5 text-white shadow-lg shadow-blue-600/30">
        <div className="flex flex-wrap items-center gap-4">
          <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-white/15 backdrop-blur"><ImagePlus size={22}/></span>
          <div className="min-w-0 flex-1">
            <b className="block text-lg font-black">हेडर फोटो — मिनी व्यवस्थापन</b>
            <small className="block text-white/80">लोगो र विज्ञापनको बीचमा देखिने एउटा मात्र सानो फोटो</small>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={"flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black " + (photo ? "bg-emerald-400 text-emerald-950" : "bg-white/15 text-white")}>
              <span className={"h-2 w-2 rounded-full " + (photo ? "bg-emerald-700" : "bg-amber-300")}></span>
              {photo ? "फोटो सक्रिय" : "खाली — मौसम+मिति देखिन्छ"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800"><span className="h-2 w-2 rounded-full bg-blue-600"/> हेडर प्रिभ्यू (यस्तो देखिनेछ)</h3>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
            <span className="grid h-9 w-9 flex-none place-items-center rounded-lg bg-blue-600 text-base font-black text-white">न</span>
            <span className="hidden h-9 w-px bg-slate-200 sm:block"></span>
            {effective ? (
              <img src={absoluteUrl(effective)} alt="हेडर फोटो प्रिभ्यू" className="h-9 w-auto max-w-[150px] rounded-lg object-cover ring-1 ring-slate-200"/>
            ) : (
              <span className="min-w-0 text-[11px] font-bold leading-tight text-slate-500">☁ काठमाडौं • २४°C <i className="block font-semibold text-slate-400">मिति / समय</i></span>
            )}
            <span className="ml-auto hidden h-9 min-w-0 flex-1 items-center justify-end rounded-lg border border-dashed border-slate-300 bg-white/70 px-3 text-[10px] font-bold text-slate-400 sm:flex">विज्ञापन स्लट</span>
          </div>
          <ul className="mt-4 space-y-1.5 text-[11px] font-bold text-slate-400">
            <li>✓ फोटो राख्दा — मौसम र मिति/समय लुकेर सानो फोटो लोगो र विज्ञापनको बीचमा देखिन्छ</li>
            <li>✓ फोटो हटाउँदा — मौसम + मिति/समय पूरानै ठाउँमा फर्कन्छन्</li>
            <li>✓ एउटा मात्र फोटो सम्भव — नयाँ थप्दा पुरानो आफैं बदलिन्छ</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <ImagePicker file={file} setFile={setFile} preview={prev} setPreview={setPrev} disabled={busy} hint={"हेडरको लागि १ वटा फोटो — क्लिक, तानेर राख्नुहोस् वा Ctrl+V"}/>
          {file && <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-700">नयाँ फोटो छानियो — "हेडर फोटो बचत" थिच्नुहोस्।</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {photo && (
          <Btn kind="danger" type="button" onClick={remove} disabled={busy}><Trash2 size={16}/> फोटो हटाउने</Btn>
        )}
        <Btn kind="ghost" type="button" onClick={() => { setFile(null); setPrev(""); }} disabled={busy}>रद्द गर्नुहोस्</Btn>
        <Btn type="submit" disabled={busy}>
          {busy ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>}
          {busy ? "अपलोड हुँदै..." : "हेडर फोटो बचत"}
        </Btn>
      </div>
    </form>
  );
}