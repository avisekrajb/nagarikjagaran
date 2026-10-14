import React from "react";
import useSports from "../../hooks/useSports";
import CategoryShowcase from "../../components/Category/CategoryShowcase";
import Loading from "../../components/Common/Loading";

export default function Sports() {
  const { news, loading } = useSports();
  if (loading) return <Loading />;
  return (
    <CategoryShowcase
      title="खेलकुद"
      description="नेपाली तथा अन्तर्राष्ट्रिय खेल जगत्का रोमाञ्चक क्षण, नतिजा र खेलाडीका प्रेरक कथाहरू।"
      variant="scoreboard"
      accent={{ grad: "from-emerald-700 via-emerald-600 to-green-500", solid: "bg-emerald-600", text: "text-emerald-600", soft: "bg-emerald-50", quote: "from-emerald-700 to-green-600" }}
      news={news}
      showBanner={false}
    />
  );
}