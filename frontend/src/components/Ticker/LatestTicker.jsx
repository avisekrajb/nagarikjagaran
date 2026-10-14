import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllNews } from "../../services/newsService";

/* समाचार बढ्दै जाँदा पनि गति उही रहोस् — प्रति शीर्षक ~४ सेकेण्ड।
   पहिले २.४ थियो, अब धिलो गरिएको ४ सेकेण्ड प्रति शीर्षक। */
const secsFor = (n) => Math.min(1200, Math.max(100, Math.round(n * 4.0)));

export default function LatestTicker() {
  const [items, setItems] = useState(null);
  useEffect(() => {
    getAllNews().then(setItems).catch(() => setItems([]));
  }, []);

  const count = Array.isArray(items) ? items.length : 0;

  return (
    <div className="ticker">
      <span className="ticker-label">ताजा खबर</span>
      <div className="ticker-viewport">
        <div className="ticker-track" style={{ "--marquee-dur": `${secsFor(count)}s` }}>
          {[0, 1].map((g) => (
            <div className="ticker-group" key={g}>
              {count ? (
                items.map((n) => (
                  <Link key={n.id + g} to={`/article/${n.id}`} className="ticker-item">{n.title}</Link>
                ))
              ) : (
                <span key={"empty" + g} className="ticker-item">हालसम्म कुनै समाचार उपलब्ध छैन।</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}