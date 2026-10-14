export const shareArticle = async (article) => {
  const url = window.location.href;
  if (navigator.share) return navigator.share({title: article.title, text: article.summary, url});
  try { await navigator.clipboard.writeText(url); return true; } catch { return false; }
};
