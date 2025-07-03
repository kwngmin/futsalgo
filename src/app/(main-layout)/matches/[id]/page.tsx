"use client";

import { useParams } from "next/navigation";

const MatchDetailPage = () => {
  const { id } = useParams();
  return <div>{id}</div>;
};

export default MatchDetailPage;
