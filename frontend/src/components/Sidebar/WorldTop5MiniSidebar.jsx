import React, { useState, useEffect } from "react";
import { newestFirst } from "../../utils/sortNews";
import { getNewsByCategory } from "../../services/newsService";
import SideFeed, { SideBlock } from "./SideFeed";

export default function WorldTop5MiniSidebar() {
  const [news, setNews] = useState([]);
  useEffect(() => {
    getNewsByCategory("विश्व")
      .then((n) => setNews(newestFirst(n).slice(0, 5)))
      .catch(() => {});
  }, []);

  return (
    <SideBlock title="विश्व">
      <SideFeed items={news} number showThumb={false} />
    </SideBlock>
  );
}