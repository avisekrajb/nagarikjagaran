import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { nepaliDate } from "../../../utils/formatDate";
import { adminApi } from "../../../services/adminApi";
import { Btn, Th, Td } from "./AdminUI";

export default function AdminMessages({ setMsg }) {
  const [items, setItems] = useState([]);
  const load = async () => { try { setItems(await adminApi.listContacts()); } catch (e) { setMsg(e.message); } };
  useEffect(() => { load(); }, []);

  const remove = async (c) => {
    if (!window.confirm(`"${c.name}" को सन्देश मेट्ने हो?`)) return;
    try { await adminApi.deleteContact(c.id); setMsg("सन्देश मेटियो"); load(); } catch (err) { setMsg(err.message); }
  };

  const fmt = (d) => {
    try { return nepaliDate(d); }
    catch (e) { return d || ""; }
  };

  return (
    <div>
      <div className="mb-4"><p className="text-sm text-slate-500">{items.length} वटा सन्देश — <span className="font-bold">/contact</span> पेजको फारमबाट आउँछन्</p></div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr><Th>नाम</Th><Th>इमेल</Th><Th>सन्देश</Th><Th>मिति</Th><Th className="text-right">कार्य</Th></tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="align-top hover:bg-slate-50/60">
                <Td><b className="text-slate-700">{c.name}</b></Td>
                <Td className="text-slate-500"><a href={`mailto:${c.email}`} className="font-bold text-brand-700 hover:underline">{c.email}</a></Td>
                <Td className="max-w-md whitespace-pre-wrap leading-6 text-slate-600">{c.message}</Td>
                <Td className="whitespace-nowrap text-xs text-slate-400">{fmt(c.created_at)}</Td>
                <Td className="text-right"><Btn kind="danger" onClick={() => remove(c)}><Trash2 size={15}/> मेट्ने</Btn></Td>
              </tr>
            ))}
            {!items.length && <tr><td colSpan="5" className="px-4 py-10 text-center text-slate-400">कुनै सन्देश छैन। सम्पर्क पेजको फारमबाट सन्देश आउँछन्।</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}