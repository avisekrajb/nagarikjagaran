import React from "react";
import { ArrowUp } from "lucide-react";
import useScroll from "../../hooks/useScroll";

export default function BackToTop() {
  const y = useScroll();
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="माथि जानुहोस्"
      className={`back-to-top fixed bottom-6 right-5 z-40 rounded-full bg-brand-600 p-3 text-white shadow-xl ${y >= 500 ? "is-on" : ""}`}
    >
      <ArrowUp />
    </button>
  );
}