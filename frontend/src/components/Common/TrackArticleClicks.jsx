import { useEffect } from "react";
import { incrementNewsClick } from "../../services/newsService";

/**
 * समाचारमा "क्लिक" गन्ने गणना।
 *
 * अघि `incrementNewsClick` खलबलको share/copy बटनमा मात्र थियो — यानी
 * कार्ड थिचेर समाचार पढ्ने कामले क्लिक गन्ने गणना हुँदैनथ्यो
 * (dृश्य ४१, क्लिक ०)। अब कुनै पनि `/article/:id` लिंक थिचिएमा गणना हुन्छ।
 *
 * एउटै delegated listener — सबै कार्ड (गृहपृष्ठ, श्रेणी, साइडबार,
 * सम्बन्धित) मा एकैपटक लागू हुन्छ।
 */
export default function TrackArticleClicks() {
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target?.closest?.('a[href^="/article/"]');
      if (!a) return;
      const id = (a.getAttribute("href") || "").split("/").pop();
      if (id) incrementNewsClick(id);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
