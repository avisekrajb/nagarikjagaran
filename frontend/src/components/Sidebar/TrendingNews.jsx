import { useState, useEffect } from "react";
import { getTrendingNews } from "../../services/newsService";
import SideFeed, { SideBlock } from "./SideFeed";

/* ट्रेन्डिङ — क्लिक/दृश्य अनुसार क्रम, मिति अनुसार होइन। */
export default function TrendingNews() {
  const [news, setNews] = useState([]);
  useEffect(() => {
    getTrendingNews(5, 30).then(setNews).catch(() => {});
  }, []);

  return (
    <SideBlock title="ट्रेन्डिङ">
      <SideFeed items={news} number empty="अहिलेसम्म ट्रेन्डिङ डाटा छैन।" />
    </SideBlock>
  );
}