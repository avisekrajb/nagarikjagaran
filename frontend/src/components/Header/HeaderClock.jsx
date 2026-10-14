import React, { useEffect, useState } from "react";
import { CalendarDays, Clock } from "lucide-react";
import { formatDateLong } from "../../utils/formatDate";
import { formatTime } from "../../utils/formatTime";

const tick = () => {
  const now = new Date();
  return `${formatDateLong(now)}|${formatTime(now)}`;
};

export default function HeaderClock() {
  const [val, setVal] = useState(tick);
  useEffect(() => {
    let prev = val;
    const id = setInterval(() => {
      const next = tick();
      if (next !== prev) { prev = next; setVal(next); }
    }, 1000);
    return () => clearInterval(id);
  }, [val]);
  const [date, time] = val.split("|");
  return (
    <div className="flex flex-col items-start gap-0.5 text-xs text-slate-600">
      <span className="inline-flex items-center gap-1 whitespace-nowrap font-bold tabular-nums text-slate-800"><CalendarDays size={12} className="text-brand-600" />{date}</span>
      <span className="inline-flex items-center gap-1 whitespace-nowrap font-bold tabular-nums text-brand-600"><Clock size={12} />{time}</span>
    </div>
  );
}