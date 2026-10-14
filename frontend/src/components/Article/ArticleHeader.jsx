import React from "react";

// ब्यानरमा केवल शीर्षक देखिन्छ — उप-शीर्षक र सारांश हटाइएको
export default function ArticleHeader({ article }) {
  return (
    <header className="article-header">
      <h1 className="article-title">{article.title}</h1>
    </header>
  );
}
