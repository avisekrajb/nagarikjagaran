import React, { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { adminApi } from "../../../services/adminApi";
import { absoluteUrl } from "../../../services/api";
import { Btn, Input, TextArea } from "./AdminUI";

export default function AdminFooter({ setMsg }) {
  const [f, setF] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const load = async () => { try { setF(await adminApi.getFooter()); } catch (e) { setMsg(e.message); } };
  useEffect(() => { load(); }, []);

  const set = (k, v) => setF({ ...f, [k]: v });
  const save = async (e) => {
    e.preventDefault();
    try {
      let logo = f.logo || "";
      if (logoFile) {
        const fd = new FormData();
        fd.append("category", "logo");
        fd.append("image", logoFile);
        const up = await adminApi.upload(fd);
        logo = up.url;
      }
      await adminApi.updateFooter({ ...f, logo });
      setMsg("फुटर अपडेट भयो");
      load();
    } catch (err) { setMsg(err.message); }
  };

  if (!f) return <p className="py-10 text-center text-slate-400">लोड हुँदैछ...</p>;
  return (
    <form onSubmit={save} className="max-w-3xl space-y-4">
      <div className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="grid h-20 w-20 flex-none place-items-center overflow-hidden rounded-2xl bg-white shadow-sm">
          {f.logo ? <img src={absoluteUrl(f.logo)} alt="logo" className="h-full w-full object-contain p-1"/> : <span className="text-3xl font-black text-brand-600">न</span>}
        </div>
        <div className="min-w-0">
          <span className="mb-1 block text-sm font-bold text-slate-600">लोगो (हेडर र फुटरमा एकै पटक देखिनेछ)</span>
          <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files && e.target.files[0]; if (file) setLogoFile(file); }} className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-blue-700"/>
          {logoFile && <p className="mt-1 text-xs font-bold text-emerald-600">नयाँ लोगो चयन भयो — बचत गर्दा लागू हुनेछ</p>}
        </div>
      </div>
      <TextArea label="विवरण (description)" rows={3} value={f.description || ""} onChange={(e) => set("description", e.target.value)}/>
      <TextArea label="मुख्य वाक्य (मोट्टो)" rows={1} value={f.motto || ""} onChange={(e) => set("motto", e.target.value)}/>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="सम्पादक" value={f.editor || ""} onChange={(e) => set("editor", e.target.value)}/>
        <Input label="दर्ता प्रमाणपत्र नं." value={f.registration || ""} onChange={(e) => set("registration", e.target.value)}/>
        <Input label="प्रेस काउन्सिल नं." value={f.press_council || ""} onChange={(e) => set("press_council", e.target.value)}/>
        <Input label="कम्पनी रजिस्टर" value={f.company_reg || ""} onChange={(e) => set("company_reg", e.target.value)}/>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="इमेल" value={f.email || ""} onChange={(e) => set("email", e.target.value)}/>
        <Input label="फोन" value={f.phone || ""} onChange={(e) => set("phone", e.target.value)}/>
        <Input label="फेसबुक URL" value={f.facebook || ""} onChange={(e) => set("facebook", e.target.value)}/>
        <Input label="इन्स्टाग्राम URL" value={f.instagram || ""} onChange={(e) => set("instagram", e.target.value)}/>
      </div>
      <Input label="युट्युब URL" value={f.youtube || ""} onChange={(e) => set("youtube", e.target.value)}/>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className="mb-1 block text-sm font-bold text-slate-600">मिनी नयाभर रंग</span>
          <input type="color" value={f.mini_navbar_color || "#1e3a8a"} onChange={(e) => set("mini_navbar_color", e.target.value)} className="h-10 w-20 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer" />
        </div>
        <div>
          <span className="mb-1 block text-sm font-bold text-slate-600">मार्की/ताजा खबर रंग</span>
          <input type="color" value={f.marquee_color || "#064e3b"} onChange={(e) => set("marquee_color", e.target.value)} className="h-10 w-20 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer" />
        </div>
      </div>
      <div className="flex justify-end"><Btn type="submit"><Save size={16}/> फुटर बचत गर्नुहोस्</Btn></div>
    </form>
  );
}