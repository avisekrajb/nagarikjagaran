import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { nepaliDate } from "../../../utils/formatDate";
import { adminApi } from "../../../services/adminApi";
import { Btn, Th, Td } from "./AdminUI";

export default function AdminSubscribers({ setMsg }) {
  const [items, setItems] = useState([]);
  const load = async () => { try { setItems(await adminApi.listSubscribers()); } catch (e) { setMsg(e.message); } };
  useEffect(() => { load(); }, []);

  const remove = async (s) => {
    if (!window.confirm(`"${s.email}" लाई सूचीबाट हटाउने हो?`)) return;
    try { await adminApi.deleteSubscriber(s.id); setMsg("सब्सक्राइबर हटाइयो"); load(); } catch (err) { setMsg(err.message); }
  };

  const fmt = (d) => {
    try { return nepaliDate(d); }
    catch (e) { return d || ""; }
  };

  return (
    <div>
      <div className="mb-4"><p className="text-sm text-slate-500">{items.length} वटा सब्सक्राइबर</p></div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr><Th>इमेल</Th><Th className="text-right">कार्य</Th></tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/60">
                <Td><b className="text-slate-700">{s.email}</b> <small className="block text-xs text-slate-400">{fmt(s.created_at)}</small></Td>
                <Td className="text-right"><Btn kind="danger" onClick={() => remove(s)}><Trash2 size={15}/> हटाउने</Btn></Td>
              </tr>
            ))}
            {!items.length && <tr><td colSpan="2" className="px-4 py-10 text-center text-slate-400">कुनै सब्सक्राइबर छैन। फुटरको SUBSCRIBE बक्सबाट इमेल आउँछन्।</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}