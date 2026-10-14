import React from "react";
import { Play } from "lucide-react";

export default function ReelCard({ reel, onOpen }) {
  return (
    <button onClick={() => onOpen(reel)} className="reel-card text-left">
      {reel.image ? (
        <img src={reel.image} alt={reel.title} />
      ) : (
        <div className="grid h-full w-full place-items-center bg-gradient-to-br from-blue-800 via-blue-600 to-sky-500">
          <Play fill="white" size={30} />
        </div>
      )}
      <span className="play"><Play fill="white" size={18} /></span>
      <div className="reel-meta">
        {reel.category && <small>{reel.category}</small>}
        <h3>{reel.title}</h3>
      </div>
    </button>
  );
}