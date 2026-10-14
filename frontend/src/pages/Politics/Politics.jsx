import React from "react";
import usePolitics from "../../hooks/usePolitics";
import CategoryShowcase from "../../components/Category/CategoryShowcase";
import Loading from "../../components/Common/Loading";

export default function Politics() {
  const { news, loading } = usePolitics();
  if (loading) return <Loading />;
  return (
    <CategoryShowcase
      title="राजनीति"
      description="राजनीतिक घटनाक्रम, सत्ता संघर्ष र नीतिगत निर्णयका ताजा, विश्वसनीय तथा सान्दर्भिक समाचार र विश्लेषण।"
      variant="featured"
      accent={{ grad: "from-red-700 via-red-600 to-orange-500", solid: "bg-red-600", text: "text-red-600", soft: "bg-red-50", quote: "from-red-600 to-orange-500" }}
      news={news}
      showBanner={false}
    />
  );
}