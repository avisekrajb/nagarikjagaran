import React from "react";
import PopularNews from "./PopularNews";
import SidebarAd from "./SidebarAd";
import TrendingNews from "./TrendingNews";
import WorldTop5MiniSidebar from "./WorldTop5MiniSidebar";
import UpcomingHolidays from "./UpcomingHolidays";
import MiniCalendar from "./MiniCalendar";
import PollWidget from "../PollWidget";
import FeatureToggle from "../FeatureToggle";

export default function MiniSidebar() {
  return (
    /* min-w-0 अनिवार्य : grid मा min-width:auto भए विज्ञापनको
       आन्तरिक चौडाइले ३००px स्तम्भ नाघेर overflow गराउँछ */
    <aside className="min-w-0 space-y-5">
      <PopularNews />
      <SidebarAd />
      <TrendingNews />
      <WorldTop5MiniSidebar />
      {/* सुपर एडमिनले बनाएको पोल */}
      <PollWidget />
      {/* आगामी बिदा तथा पर्व */}
      <UpcomingHolidays />
      {/* मिनी साइडबारको अन्त्यमा पात्रो */}
      <FeatureToggle flag="show_patro">
        <MiniCalendar />
      </FeatureToggle>
    </aside>
  );
}