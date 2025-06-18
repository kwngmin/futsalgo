"use client";

import { getTeam } from "../model/actions";
import { useQuery } from "@tanstack/react-query";

const TeamContent = ({ id }: { id: string }) => {
  const { data } = useQuery({
    queryKey: ["player", id],
    queryFn: () => getTeam(id),
    enabled: !!id, // id 없으면 fetch 안 함
  });
  console.log(data, "team");

  if (!data) {
    return (
      <div className="text-center text-gray-500 pt-10">
        존재하지 않는 팀입니다.
      </div>
    );
  }

  return <div>TeamContent {id}</div>;
};

export default TeamContent;
