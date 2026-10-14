import React, { useEffect, useState } from "react";
import { formatDateLong } from "../../utils/formatDate";
import { formatTime } from "../../utils/formatTime";
import WeatherWidget from "../Weather/WeatherWidget";

export default function TopBar() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="border-b border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700">
      <div className="container-shell flex h-9 items-center justify-between text-xs">
        <span className="font-bold text-slate-800">{formatDateLong(now)} • {formatTime(now)}</span>
        <WeatherWidget />
        <span className="hidden sm:block">काठमाडौं • नागरिक संवाददाता</span>
      </div>
    </div>
  );
}