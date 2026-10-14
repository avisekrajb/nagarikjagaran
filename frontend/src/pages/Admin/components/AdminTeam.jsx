import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Users, Loader2, Save } from "lucide-react";
import { adminApi } from "../../../services/adminApi";
import { absoluteUrl } from "../../../services/api";
import { Btn, Th, Td, Modal, Input, ImagePicker } from "./AdminUI";

export default function AdminTeam({ setMsg }) {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setItems(await adminApi.listTeam()); } catch (e) { setMsg(e.message); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openEdit = (m) => setModal({ id: m.id, name: m.name, role: m.role || "", email: m.email || "", phone: m.phone || "", photo: m.photo || "", file: null });
  const openNew = () => setModal({ id: null, name: "", role: "", email: "", phone: "", photo: "", file: null });

  const save = async (e) => {
    e.preventDefault();
    if (!modal.name.trim()) { setMsg("नाम लेख्नुहोस्"); return; }
    const fd = new FormData();
    fd.append("category", "team");
    fd.append("name", modal.name);
    fd.append("role", modal.role);
    fd.append("email", modal.email);
    fd.append("phone", modal.phone);
    if (modal.file) fd.append("image", modal.file);
    else fd.append("imageUrl", modal.photo || "");
    setBusy(true);
    try {
      if (modal.id) await adminApi.updateTeam(modal.id, fd);
      else await adminApi.createTeam(fd);
      setModal(null);
      setMsg(modal.id ? "टिम सदस्य अपडेट भयो" : "टिम सदस्य थपियो");
      load();
    } catch (err) { setMsg(err.message); }
    finally { setBusy(false); }
  };

  const remove = async (m) => {
    if (!window.confirm(`"${m.name}" लाई टिमबाट हटाउने हो?`)) return;
    try { await adminApi.deleteTeam(m.id); setMsg("टिम सदस्य हटाइयो"); load(); } catch (err) { setMsg(err.message); }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">{items.length} वटा टिम सदस्य — <span className="font-bold">{"/ourteam"}</span> पेजमा ग्रिडमा देखिन्छन्</p>
        <Btn onClick={openNew}><Plus size={16}/> नयाँ सदस्य</Btn>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr><Th>फोटो</Th><Th>नाम</Th><Th>भूमिका</Th><Th>इमेल</Th><Th>फोन</Th><Th className="text-right">कार्य</Th></tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50/60">
                <Td>{m.photo ? <img src={absoluteUrl(m.photo)} alt="" className="h-11 w-11 rounded-full object-cover"/> : <div className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-400">NO</div>}</Td>
                <Td><b className="text-slate-800">{m.name}</b></Td>
                <Td><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-brand-700">{m.role || "—"}</span></Td>
                <Td className="text-slate-500">{m.email || "—"}</Td>
                <Td className="whitespace-nowrap text-slate-500">{m.phone || "—"}</Td>
                <Td className="text-right">
                  <div className="inline-flex gap-2">
                    <Btn kind="soft" onClick={() => openEdit(m)}><Pencil size={15}/> सम्पादन</Btn>
                    <Btn kind="danger" onClick={() => remove(m)}><Trash2 size={15}/> हटाउने</Btn>
                  </div>
                </Td>
              </tr>
            ))}
            {!loading && !items.length && <tr><td colSpan="6" className="px-4 py-10 text-center text-slate-400">कुनै टिम सदस्य छैन। "नयाँ सदस्य" थप्नुहोस्।</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal.id ? "टिम सदस्य सम्पादन" : "नयाँ टिम सदस्य"} onClose={() => setModal(null)}>
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="पूरा नाम" required placeholder="जस्तै: सागर श्रेष्ठ" value={modal.name} onChange={(e) => setModal({ ...modal, name: e.target.value })}/>
              <Input label="भूमिका / पद" placeholder="जस्तै: सम्पादक, संवाददाता" value={modal.role} onChange={(e) => setModal({ ...modal, role: e.target.value })}/>
              <Input label="इमेल" placeholder="name@example.com" value={modal.email} onChange={(e) => setModal({ ...modal, email: e.target.value })}/>
              <Input label="फोन" placeholder="९८४१३७२४६०" value={modal.phone} onChange={(e) => setModal({ ...modal, phone: e.target.value })}/>
            </div>
            <ImagePicker file={modal.file} setFile={(f) => setModal((m) => (m ? { ...m, file: f } : m))} preview={modal.file ? modal.preview : modal.photo} setPreview={(p) => setModal((m) => (m ? { ...m, preview: p } : m))} disabled={busy} hint={"प्रोफाइल फोटो — टिम पेजमा गोलो ग्रिडमा देखिन्छ"}/>
            <div className="flex justify-end gap-2 pt-1">
              <Btn kind="ghost" type="button" onClick={() => setModal(null)} disabled={busy}>रद्द गर्नुहोस्</Btn>
              <Btn type="submit" disabled={busy}>
                {busy ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>}
                {busy ? "अपलोड हुँदै..." : "बचत गर्नुहोस्"}
              </Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}