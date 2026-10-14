import { useCallback, useMemo, useState } from "react";
import { newestFirst } from "../utils/sortNews";

/**
 * नयाँ समाचार माथि राखेर, स्क्रोल गर्दा-गर्दा बिस्तारै देखाउने।
 *
 * @param list      सबै समाचार
 * @param pageSize  एकपटकमा कति देखाउने
 * @param skip      सुरुका कति बचाउने (मुख्य समाचार हेडिङ भइसकेको हुन्छ)
 */
export default function usePagedNews(list = [], pageSize = 9, skip = 0) {
  const sorted = useMemo(() => newestFirst(list), [list]);
  const [shown, setShown] = useState(pageSize);

  const body = useMemo(() => sorted.slice(skip), [sorted, skip]);
  const visible = useMemo(() => body.slice(0, shown), [body, shown]);
  const done = shown >= body.length;

  /* नयाँ डाटा आएमा सुरुमै फर्कने (नयाँ समाचार माथि देखिन्छ) */
  const reset = useCallback(() => setShown(pageSize), [pageSize]);

  const loadMore = useCallback(() => {
    setShown((n) => Math.min(n + pageSize, Math.max(body.length, n + 1)));
  }, [pageSize, body.length]);

  return { sorted, body, visible, done, loadMore, reset };
}