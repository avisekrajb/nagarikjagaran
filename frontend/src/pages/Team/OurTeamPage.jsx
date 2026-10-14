import React, { useEffect, useState } from "react";
import { Mail, Phone, Users } from "lucide-react";
import { motion } from "framer-motion";
import SectionHeader from "../../components/NewsSection/SectionHeader";
import { getTeam } from "../../services/newsService";

const rise = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };
const cascade = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const viewOnce = { once: true, amount: 0.15 };

export default function OurTeamPage() {
  const [team, setTeam] = useState([]);
  useEffect(() => { getTeam().then(setTeam); }, []);

  return (
    <main className="container-shell py-7">
      <motion.div variants={rise}  className="mb-6">
        <SectionHeader title="हाम्रो टिम" />
        <p className="mt-1 text-sm font-bold text-slate-500">समाचार, विश्लेषण र विचारलाई निरन्तरता दिने हाम्रो टिम — सत्य, तथ्य र निष्पक्षताप्रति प्रतिबद्ध।</p>
      </motion.div>

      {team.length ? (
        <motion.div variants={cascade}  className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {team.map((m) => (
            <motion.div key={m.id} variants={rise}>
              <div className="group overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-soft transition duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl relative">
                {/* Snake border effect */}
                <div className="absolute inset-[-2px] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-600 via-sky-400 to-emerald-500 bg-[length:300%_100%] animate-[snakeBorder_2s_linear_infinite] -z-10"></div>
                <div className="relative mx-auto h-28 w-28">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-600 to-sky-400 opacity-20 blur-lg transition group-hover:opacity-40"></div>
                  {m.photo ? (
                    <img src={m.photo} alt={m.name} className="relative h-28 w-28 rounded-full object-cover transition duration-300 group-hover:scale-105 ring-4 ring-white ring-offset-2 ring-offset-white group-hover:ring-blue-500" />
                  ) : (
                    <div className="relative grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-brand-600 to-sky-400 text-3xl font-black text-white"><Users size={40} /></div>
                  )}
                </div>
                <h3 className="mt-4 text-lg font-black text-slate-900">{m.name}</h3>
                {m.role && <span className="mt-1 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-black text-brand-700">{m.role}</span>}
                <div className="mt-4 space-y-1.5 text-sm font-bold text-slate-500">
                  {m.email && <p className="flex items-center justify-center gap-1.5"><Mail size={14} className="text-slate-400" /> {m.email}</p>}
                  {m.phone && <p className="flex items-center justify-center gap-1.5"><Phone size={14} className="text-slate-400" /> {m.phone}</p>}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center text-sm font-bold text-slate-400">टिम सदस्यहरू थपिएका छैनन्।</div>
      )}
    </main>
  );
}