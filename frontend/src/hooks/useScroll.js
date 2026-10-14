import { useEffect, useState } from "react";

export default function useScroll() {
  const [y, setY] = useState(0);

  useEffect(() => {
    let raf = 0;
    const read = () => setY(window.scrollY || 0);
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return y;
}