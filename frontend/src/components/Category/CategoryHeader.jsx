import React from "react";

export default function CategoryHeader({ title, description, titleOnly = false }) {
  return (
    <div className="category-hero">
      <h1>{title}</h1>
      {!titleOnly && <p>{description || "विश्वसनीय, सान्दर्भिक र नेपाली समाजसँग जोडिएका समाचारहरू।"}</p>}
    </div>
  );
}