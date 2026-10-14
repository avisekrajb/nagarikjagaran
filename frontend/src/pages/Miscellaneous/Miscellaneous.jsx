import React from "react";
import useMiscellaneous from "../../hooks/useMiscellaneous";
import CategoryShowcase from "../../components/Category/CategoryShowcase";
import Loading from "../../components/Common/Loading";

export default function Miscellaneous() {
  const { news, loading } = useMiscellaneous();
  if (loading) return <Loading />;
  return (
    <CategoryShowcase
      title="विविध"
      description="उद्यमशीलता, संस्कृति, वातावरण र समाजका अरू कथा — जुन समाचार हुन्छ तर वर्गमा अटाउँदैन।"
      variant="magazine"
      accent={{ grad: "from-slate-900 via-slate-800 to-black", solid: "bg-slate-900", text: "text-slate-900", soft: "bg-slate-100", quote: "from-slate-900 to-slate-700" }}
      news={news}
      showBanner={false}
    />
  );
}