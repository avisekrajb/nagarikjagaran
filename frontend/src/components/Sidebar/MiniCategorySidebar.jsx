import React from "react";
import { Link } from "react-router-dom";
import AdSlot from "../Ads/AdSlot";
import FramerSidebar from "./FramerSidebar";
import MiniCalendar from "./MiniCalendar";
import SideFeed, { SideBlock } from "./SideFeed";

/**
 * होमपेजको ब्यानर/मुख्य सामग्रीको दायाँ मिनी साइडबार।
 * आधुनिक `.side-box` + `.side-feed` ढाँचा प्रयोग गर्छ (शीर्षक, सानो फोटो, मिति)।
 */
export default function MiniCategorySidebar({ title, path, adPosition, news = [], target = null }) {
  return (
    <aside className="space-y-5">
      <AdSlot position={adPosition} />

      <FramerSidebar target={target}>
        <SideBlock
          title={title}
          action={
            path && (
              <Link to={path} className="text-xs font-bold text-brand-600 hover:underline">
                सबै हेर्नुहोस्
              </Link>
            )
          }
        >
          <SideFeed items={news} empty={`${title} समाचार छैन।`} />
        </SideBlock>
      </FramerSidebar>

      {/* मिनी साइडबारको अन्त्यमा पात्रो */}
      <MiniCalendar />
    </aside>
  );
}
