"use client";

import { useState } from "react";
import { Search, ArrowDownUp } from "lucide-react";
import { useSession } from "next-auth/react";
import { getPlayers } from "./model/actions";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import PlayerCard from "./ui/PlayerCard";
import { User } from "@prisma/client";
import SkeletonContent from "./ui/SkeletonPlayerContent";
import { FieldModal } from "@/app/(no-layout)/profile/ui/FieldModal";
import FilterModal from "./ui/FilterModal";

const filterOptions = [
  { id: "all", label: "전체" },
  { id: "MALE", label: "남자" },
  { id: "FEMALE", label: "여자" },
];

type FilterType = "all" | "MALE" | "FEMALE" | "following";

const PlayersPage = () => {
  const session = useSession();
  const isLoggedIn = session.status === "authenticated";

  const [modalStates, setModalStates] = useState({
    sort: false,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["players"],
    queryFn: getPlayers,
    placeholderData: keepPreviousData,
  });

  console.log(data, "data");
  // console.log(user, "user");
  // console.log(players, "players");
  console.log(isLoading, "isLoading");
  console.log(error, "error");

  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");

  // 필터에 따라 회원 목록 필터링
  const filteredPlayers = data?.data?.players?.filter((player: User) => {
    if (selectedFilter === "all") return true;
    // if (selectedFilter === "following") return player.isFollowing;
    return player.gender === selectedFilter;
  });

  console.log(filteredPlayers, "filteredPlayers");

  const openModal = (field: keyof typeof modalStates) => {
    setModalStates((prev) => ({ ...prev, [field]: true }));
  };

  const closeModal = (field: keyof typeof modalStates) => {
    setModalStates((prev) => ({ ...prev, [field]: false }));
  };

  const renderFieldModal = (
    field: "sort"
    // title: string
  ) => (
    <FieldModal
      title={`정렬`}
      open={modalStates[field]}
      onOpenChange={(open) => {
        if (!open) closeModal(field);
      }}
      trigger={
        <button
          className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          onClick={() => openModal(field)}
        >
          <ArrowDownUp className="w-5 h-5" />
        </button>
      }
    >
      <FilterModal
        filter={selectedFilter}
        setFilter={setSelectedFilter}
        onSuccess={() => closeModal(field)}
      />
    </FieldModal>
  );

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0">
        <div className="flex gap-3">
          <h1 className="text-2xl font-bold">회원</h1>
          <h1 className="text-2xl font-bold opacity-30">팔로잉</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <Search className="w-5 h-5" />
          </button>
          {/* <button className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-white rounded-full transition-colors cursor-pointer bg-gray-100">
            <ArrowDownUp className="w-5 h-5" />
          </button> */}
          {renderFieldModal("sort")}
        </div>
      </div>
      {data ? (
        <div className="space-y-3">
          {/* 내 프로필 섹션 */}
          {isLoggedIn && data?.data?.user ? (
            <PlayerCard
              player={data?.data?.user}
              isCurrentUser={true}
              teamName={data?.data?.user?.teams[0]?.team?.name}
              teamLogoUrl={
                data?.data?.user?.teams[0]?.team?.logoUrl || undefined
              }
            />
          ) : null}

          {/* 필터 섹션 */}
          {/* <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 justify-between">
              <div className="flex gap-1 bg-gray-100 rounded-full p-1">
                {filterOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedFilter(option.id as FilterType)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors cursor-pointer ${
                      selectedFilter === option.id
                        ? "bg-slate-600 text-white font-bold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div> */}

          {/* 회원 목록 */}
          <div className="bg-white rounded-2xl">
            {filteredPlayers?.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                teamName={player.teams[0]?.team?.name}
                teamLogoUrl={player.teams[0]?.team?.logoUrl || undefined}
              />
            ))}
          </div>

          {/* 회원이 없는 경우 */}
          {filteredPlayers?.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedFilter === "all"
                  ? "회원이 없습니다"
                  : selectedFilter === "following"
                  ? "팔로잉한 회원이 없습니다"
                  : `${
                      filterOptions.find((f) => f.id === selectedFilter)?.label
                    } 회원이 없습니다`}
              </h3>
              <p className="text-gray-500 mb-6">다른 필터를 선택해보세요</p>
            </div>
          )}
        </div>
      ) : (
        <SkeletonContent />
      )}
    </div>
  );
};

export default PlayersPage;
