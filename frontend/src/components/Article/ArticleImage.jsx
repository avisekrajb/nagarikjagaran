import React from "react";
import Watermark from "../Common/Watermark";

export default function ArticleImage({ article }) {
  return (
    <figure className="relative my-7">
      <img className="article-image" src={article.image} alt={article.title} />
      <Watermark />
    </figure>
  );
}
