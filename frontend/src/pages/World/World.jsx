import React from "react";
import useWorld from "../../hooks/useWorld";
import CategoryShowcase from "../../components/Category/CategoryShowcase";
import Loading from "../../components/Common/Loading";

export default function World() {
  const { news, loading } = useWorld();
  if (loading) return <Loading />;
  return (
    <CategoryShowcase
      title="विश्व"
      description="महाशक्तिहरूको कूटनीति, विश्व बजार, जलवायु र अन्तर्राष्ट्रिय मञ्चका हरेक खबर एकै ठाउँमा।"
      variant="featured"
      accent={{ grad: "from-sky-700 via-sky-600 to-cyan-500", solid: "bg-sky-600", text: "text-sky-600", soft: "bg-sky-50", quote: "from-sky-700 to-cyan-600" }}
      news={news}
      showBanner={false}
    />
  );
}