import React from "react";
import { Menu } from "lucide-react";
import Brand from "../Common/Brand";
import HeaderClock from "./HeaderClock";

export default function MobileHeader({ onMenu }) {
  return (
    <div className="md:hidden">
      <div className="container-shell grid grid-cols-[auto_1fr_auto] items-center gap-2 py-3">
        <Brand />
        <div className="flex min-w-0 flex-col items-center justify-center gap-0.5 text-center">
          <HeaderClock />
        </div>
        <button onClick={onMenu} aria-label="मेनु" className="flex-none rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:bg-slate-50"><Menu/></button>
      </div>
    </div>
  );
}