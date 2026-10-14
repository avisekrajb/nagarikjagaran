import React, { useEffect, useState } from "react";
import Brand from "../Common/Brand";
import HeaderClock from "./HeaderClock";
import WeatherWidget from "../Weather/WeatherWidget";
import AdSlot from "../Ads/AdSlot";
import { getHeaderPhoto } from "../../services/newsService";

export default function DesktopHeader() {
  const [photo, setPhoto] = useState("");

  useEffect(() => {
    let off = false;
    getHeaderPhoto().then((p) => { if (!off) setPhoto(p); });
    return () => { off = true; };
  }, []);

  const hasPhoto = !!photo;

  return (
    <div className="hidden md:block">
      <div className="container-shell flex items-center gap-[2%] py-2">
        <div className="flex min-w-0 flex-1 flex-col items-center gap-y-2 lg:flex-none lg:w-[38%]">
          <div className="flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-start">
            <Brand large />
            <span className="hidden h-10 w-px bg-slate-200 lg:block"></span>
            {hasPhoto && (
              <img src={photo} alt="हेडर फोटो" className="h-20 w-auto max-w-[240px] rounded-xl object-cover shadow-sm sm:h-24 sm:max-w-[280px] lg:h-[116px]"/>
            )}
          </div>
          {!hasPhoto && (
            <div className="flex w-full flex-wrap items-center justify-center gap-x-3 sm:justify-start">
              <HeaderClock />
              <WeatherWidget />
            </div>
          )}
        </div>
        <div className="hidden min-w-0 lg:block lg:w-[60%]">
          <AdSlot position="header" />
        </div>
      </div>
    </div>
  );
}