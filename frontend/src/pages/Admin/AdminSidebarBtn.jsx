import React from "react";

export default function AdminSidebarBtn({ label, icon: Icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
          : "text-slate-500 hover:bg-slate-100 hover:text-brand-600"
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );
}