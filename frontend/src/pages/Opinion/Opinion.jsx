import React from "react";
import useOpinion from "../../hooks/useOpinion";
import CategoryShowcase from "../../components/Category/CategoryShowcase";
import Loading from "../../components/Common/Loading";

export default function Opinion() {
  const { news, loading } = useOpinion();
  if (loading) return <Loading />;
  return (
    <CategoryShowcase
      title="विचार"
      description="विश्लेषक, विज्ञ र समाजका आवाज — मुद्दाको जरा नसोचेको दृष्टिकोणबाट उजागर गर्ने विचार स्तम्भहरू।"
      variant="editorial"
      accent={{ grad: "from-violet-700 via-violet-600 to-purple-500", solid: "bg-violet-600", text: "text-violet-600", soft: "bg-violet-50", quote: "from-violet-700 to-purple-600" }}
      news={news}
    />
  );
}