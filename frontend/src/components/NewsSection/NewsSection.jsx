import React from "react"; import SectionHeader from "./SectionHeader"; import NewsGrid from "./NewsGrid";
export default function NewsSection({title,news=[]}){return <section className="section-space"><SectionHeader title={title}/><NewsGrid news={news}/></section>}
