import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const DESKTOP = "(min-width: 1024px)";

/**
 * साइडबारको स्क्रोल-सम्बन्धित हल्का झुकाव — `target` दिइएमा मात्र।
 *
 * ⚠ मुख्य कुरा : `target` नभएमा **framer-motion को कुनै hook पनि चलाउनु हुँदैन**।
 * अघि `useScroll({ target: own })` सधैँ चल्थ्यो, तर त्यस बेला plain `<div>`
 * return हुन्थ्यो — `own` ref कहिल्यै attach हुने थिएन। तब unmount हुँदा
 * framer-motion को scroll observer cleanup ले `null.removeEventListener(...)`
 * बोलाउँथ्यो :
 *   "Cannot read properties of null (reading 'removeEventListener')"
 *
 * त्यसैले hook चलाउने र नचलाउने काम छुट्टै component मा राखिएको छ —
 * React ले hook conditional हुन्छ भन्दा error दिन्छ।
 */

/** target छैन : कुनै motion hook छैन, सादा div */
function PlainSidebar({ children, className }) {
  return <div className={className}>{children}</div>;
}

/** target छ : scroll progress अनुसार झुक्ने */
function AnimatedSidebar({ children, className, target }) {
  const own = useRef(null);
  const measure = target || own;
  const { scrollYProgress } = useScroll({ target: measure, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 0.82, 1], [0, 0, -110]);

  /* मोबाइलमा साइडबार मुख्य सामग्रीको तल ओर्ल्छ — transform लगाए
     आफ्नै अगाडिका भित्र (विज्ञापन, पात्रो) माथि चढ्ने गर्छ। */
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia(DESKTOP).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP);
    const onChange = (e) => setIsDesktop(e.matches);
    setIsDesktop(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <motion.div
      ref={own}
      style={{ y: isDesktop ? y : 0 }}
      className={className}
      initial={{ opacity: 1 }}
    >
      {children}
    </motion.div>
  );
}

export default function FramerSidebar({ children, className = "", target = null }) {
  if (!target) return <PlainSidebar className={className}>{children}</PlainSidebar>;
  return (
    <AnimatedSidebar className={className} target={target}>
      {children}
    </AnimatedSidebar>
  );
}
