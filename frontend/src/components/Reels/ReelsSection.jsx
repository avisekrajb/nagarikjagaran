import React from "react";
import { useState, useEffect } from "react";
import { getReels } from "../../services/newsService";
import { absoluteUrl } from "../../services/api";
import ReelCard from "./ReelCard";
import ReelViewer from "./ReelViewer";
import SectionHeader from "../NewsSection/SectionHeader";

export default function ReelsSection() {
  const [active, setActive] = useState(null);
  const [reels, setReels] = useState(null);

  useEffect(() => {
    getReels()
      .then((r) =>
        setReels(
          r && r.length
            ? r.map((x) => ({
                id: String(x.id),
                title: x.title,
                video_url: x.video_url,
                image: absoluteUrl(x.thumbnail) || "",
                category: "रील"
              }))
            : []
        )
      )
      .catch(() => setReels([]));
  }, []);

  if (!reels || !reels.length) return null;

  return (
    <section className="section-space">
      <SectionHeader title="नागरिक रील्स" link="सबै हेर्नुहोस्" linkTo="/videos" />
      <div className="reel-row">
        {reels.map((r) => (
          <ReelCard key={r.id} reel={r} onOpen={setActive} />
        ))}
      </div>
      <ReelViewer reel={active} onClose={() => setActive(null)} />
    </section>
  );
}