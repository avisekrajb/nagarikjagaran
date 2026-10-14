import React from "react";
import AdSlot from "../Ads/AdSlot";

/* sticky हटाइयो : साइडबारमा धेरै ब्लक छन्, बाँधिएको विज्ञापनले तलका ब्लाँकमाथि चढ्छ */
export default function SidebarAd({ className = "" }) {
  return (
    <div className={className}>
      <AdSlot position="sidebar" slotClassName="overflow-hidden" />
    </div>
  );
}