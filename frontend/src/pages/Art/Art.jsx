import React from "react";
import useArt from "../../hooks/useArt";
import CategoryShowcase from "../../components/Category/CategoryShowcase";
import Loading from "../../components/Common/Loading";

export default function Art() {
  const { news, loading } = useArt();
  if (loading) return <Loading />;
  return (
    <CategoryShowcase
      title="कला/मनोरञ्जन"
      description="सिनेमा, संगीत, साहित्य र कलाकारिताका नयाँ आयाम — सिर्जनशीलताले जन्माउने हरेक कथा।"
      variant="editorial"
      accent={{ grad: "from-pink-600 via-pink-500 to-rose-400", solid: "bg-pink-600", text: "text-pink-600", soft: "bg-pink-50", quote: "from-pink-600 to-rose-500" }}
      news={news}
    />
  );
}