import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Mail, Phone, MapPin } from "lucide-react";
import ContactPanel from "./ContactPanel";

const info = [
  { icon: Mail, title: "इमेल", value: "hello@nagariknews.example" },
  { icon: Phone, title: "फोन", value: "+९७७ १ ४१२३४५६" },
  { icon: MapPin, title: "ठेगाना", value: "नागरिक मिडिया प्रा.लि., काठमाडौं, नेपाल" }
];

/**
 * सम्पर्क बटन → पपअप मोडल (सम्पर्क पेजकै सामग्री भित्रै)
 */
export default function ContactModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-5"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            {/* शीर्षक */}
            <div className="flex flex-none items-center justify-between bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 px-5 py-4 text-white sm:px-6">
              <div className="min-w-0">
                <h2 className="text-lg font-black">सम्पर्क</h2>
                <p className="truncate text-xs font-bold text-white/80">
                  सुझाव, प्रतिक्रिया वा समाचारसम्बन्धी जानकारी साझा गर्नुहोस्
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="बन्द गर्नुहोस्"
                className="grid h-9 w-9 flex-none place-items-center rounded-full bg-white/15 transition hover:rotate-90 hover:bg-white/30"
              >
                <X size={19} />
              </button>
            </div>

            {/* सामग्री */}
            <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_230px]">
              <ContactPanel compact />
              <div className="space-y-3 lg:space-y-4">
                {info.map(({ icon: Icon, title, value }) => (
                  <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
                      <Icon className="text-brand-600" size={15} /> {title}
                    </h3>
                    <p className="mt-1 break-all text-xs font-bold text-slate-500">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/** फरक-फरक ठाउँमा राख्न सकिने बटन + मोडल जोडी */
export function ContactLauncher({ children, className = "" }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children || (
          <span className="flex items-center gap-2">
            <Mail size={16} /> सम्पर्क
          </span>
        )}
      </button>
      <ContactModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
