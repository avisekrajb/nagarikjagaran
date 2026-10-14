import React, { useEffect, useState } from "react";
import { newestFirst } from "../../utils/sortNews";
import { getAllNews } from "../../services/newsService";
import SideFeed, { SideBlock } from "./SideFeed";

/**
 * होमपेजको ब्यानर साथको मिनी साइडबार।
 * मिति हटाइएको छ; सट्टामा शीर्षकको तल एक पङ्क्तिको सारांश देखिन्छ।
 */
export default function PopularNews() {
  const [news, setNews] = useState([]);
  useEffect(() => {
    getAllNews()
      .then((n) => setNews(newestFirst(n).slice(0, 4)))
      .catch(() => {});
  }, []);

  return (
    <SideBlock title="ताजा खबर">
      <SideFeed items={news} showDate={false} showSum />
    </SideBlock>
  );
}