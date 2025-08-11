"use client";

import Image from "next/image";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getScheduleMvp } from "../actions/get-schedule-mvp";
import { voteMvp } from "../actions/vote-mvp";
import { useRouter } from "next/navigation";
import { AttendanceStatus } from "@prisma/client";
import { Label } from "@/shared/components/ui/label";
import { ChevronRight, Vote } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

interface TeamAttendance {
  userId: string;
  teamType: "HOST" | "INVITED";
  attendanceStatus: AttendanceStatus;
  mvpReceived: number;
  mvpToUserId: string | null;
  user: {
    id: string;
    nickname: string | null;
    image: string | null;
  };
}

type TeamType = "host" | "invited";

const ScheduleMvp = ({ scheduleId }: { scheduleId: string }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isVoting, setIsVoting] = useState(false);
  const [selectedMvpId, setSelectedMvpId] = useState<string>("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["scheduleMvp", scheduleId],
    queryFn: () => getScheduleMvp(scheduleId),
    placeholderData: keepPreviousData,
  });

  console.log(error, "error");

  const voteMutation = useMutation({
    mutationFn: (mvpUserId: string) => voteMvp(scheduleId, mvpUserId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("MVP 투표가 완료되었습니다");
        setIsVoting(false);
        setSelectedMvpId("");
        queryClient.invalidateQueries({
          queryKey: ["scheduleMvp", scheduleId],
        });
      } else {
        toast.error(result.error || "투표 중 오류가 발생했습니다");
      }
    },
    onError: () => {
      toast.error("투표 중 오류가 발생했습니다");
    },
  });

  // 투표 수 기준으로 정렬된 참석자 목록 반환
  const getSortedAttendancesByTeamType = useMemo(() => {
    return (teamType: TeamType): TeamAttendance[] => {
      const attendances =
        data?.data?.attendances.filter(
          (attendance) =>
            attendance.teamType === (teamType === "host" ? "HOST" : "INVITED")
        ) || [];

      // 투표 수 내림차순, 동일한 경우 닉네임 오름차순으로 정렬
      return attendances.sort((a, b) => {
        if (a.mvpReceived !== b.mvpReceived) {
          return b.mvpReceived - a.mvpReceived;
        }
        const nameA = a.user.nickname || "익명";
        const nameB = b.user.nickname || "익명";
        return nameA.localeCompare(nameB);
      });
    };
  }, [data?.data?.attendances]);

  const getVotingOptions = useMemo(() => {
    return (teamType: TeamType) => {
      const attendances = getSortedAttendancesByTeamType(teamType);
      const currentUserId = data?.data?.currentUserAttendance?.userId;

      return attendances
        .filter((att) => att.user.id !== currentUserId) // 자신 제외
        .map((att) => ({
          value: att.user.id,
          label: att.user.nickname || "익명",
        }));
    };
  }, [
    getSortedAttendancesByTeamType,
    data?.data?.currentUserAttendance?.userId,
  ]);

  const handleVoteStart = () => {
    setIsVoting(true);
    // 현재 투표한 사람이 있다면 선택
    const currentVote = data?.data?.currentUserAttendance?.mvpToUserId;
    if (currentVote) {
      setSelectedMvpId(currentVote);
    }
  };

  const handleVoteCancel = () => {
    setIsVoting(false);
    setSelectedMvpId("");
  };

  const handleVoteSave = () => {
    if (!selectedMvpId) {
      toast.error("MVP를 선택해주세요");
      return;
    }
    voteMutation.mutate(selectedMvpId);
  };

  const renderLoadingSkeleton = () => (
    <div className="mt-4 px-4">
      <div className="h-12 rounded-md bg-neutral-100 animate-pulse" />
      <div className="h-[98px] rounded-2xl bg-neutral-100 animate-pulse my-2" />
      {Array.from({ length: 10 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between h-12 border-b border-gray-100 last:border-b-0"
        >
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-4 w-20 bg-neutral-100 animate-pulse" />
          </div>
          <div className="h-4 w-16 bg-neutral-100 animate-pulse" />
        </div>
      ))}
    </div>
  );

  const renderMvpSection = ({ teamType }: { teamType: TeamType }) => {
    const sortedAttendances = getSortedAttendancesByTeamType(teamType);
    const team =
      teamType === "host" ? data?.data?.hostTeam : data?.data?.invitedTeam;
    const mvpStats =
      teamType === "host"
        ? data?.data?.mvpStats?.host
        : data?.data?.mvpStats?.invited;

    if (isLoading) {
      return renderLoadingSkeleton();
    }

    return (
      <div className="mt-4 px-4">
        <div className="bg-neutral-100 overflow-hidden rounded-2xl mb-2">
          {/* 팀 정보 */}
          <div
            className="w-full flex items-center justify-between px-4 h-12 border-b gap-3 cursor-pointer bg-neutral-50 hover:bg-neutral-200 transition-colors"
            onClick={() => {
              router.push(`/teams/${team?.id}`);
            }}
          >
            <div className="flex items-center gap-2">
              {team?.logoUrl ? (
                <Image
                  src={team.logoUrl}
                  alt="team_logo"
                  width={24}
                  height={24}
                  className="rounded-lg"
                />
              ) : (
                <div className="size-6 rounded-lg bg-gray-200" />
              )}
              <span className="text-base font-medium">{team?.name ?? ""}</span>
            </div>
            <ChevronRight className="size-5 text-gray-400" />
          </div>

          {/* MVP 투표 현황 */}
          <div className="grid grid-cols-3 gap-3 px-4 py-2 mb-2">
            <div className="flex flex-col gap-1 items-center my-3">
              <div className="font-semibold">
                {mvpStats?.voted === 0 ? "없음" : `${mvpStats?.voted}명`}
              </div>
              <Label className="text-muted-foreground">투표완료</Label>
            </div>
            <div className="flex flex-col gap-1 items-center my-3">
              <div className="font-semibold">
                {mvpStats?.notVoted === 0 ? "없음" : `${mvpStats?.notVoted}명`}
              </div>
              <Label className="text-muted-foreground">미투표</Label>
            </div>
            <div className="flex flex-col gap-1 items-center my-3">
              <div className="font-semibold">{mvpStats?.voteRate || 0}%</div>
              <Label className="text-muted-foreground">투표율</Label>
            </div>
          </div>
        </div>

        {sortedAttendances.length > 0 ? (
          sortedAttendances.map((attendance, index) => (
            <div
              key={attendance.user.id}
              className="flex items-center justify-between h-12 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center gap-2">
                {attendance.user.image ? (
                  <Image
                    src={attendance.user.image}
                    alt="user_image"
                    width={32}
                    height={32}
                    className="rounded-full object-cover size-8"
                  />
                ) : (
                  <div className="size-8 rounded-full bg-gray-200" />
                )}
                <span className="font-medium">
                  {attendance.user.nickname || "익명"}
                </span>
              </div>
              <span
                className={`font-medium mx-2 ${
                  attendance.mvpReceived === 0
                    ? "text-gray-500"
                    : index === 0 && attendance.mvpReceived > 0
                    ? "text-indigo-600 font-bold"
                    : "text-emerald-600"
                }`}
              >
                {attendance.mvpReceived}표
              </span>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            참석자가 없습니다.
          </div>
        )}
      </div>
    );
  };

  const currentUserTeamType = data?.data?.currentUserAttendance?.teamType;
  const votingOptions = currentUserTeamType
    ? getVotingOptions(currentUserTeamType === "HOST" ? "host" : "invited")
    : [];

  return (
    <div className="space-y-6">
      {data?.data?.manageableTeams && data?.data?.currentUserAttendance && (
        <div className="m-4">
          {!isVoting ? (
            <button
              type="button"
              className="cursor-pointer rounded-md flex justify-center items-center gap-2 px-4 h-12 sm:h-11 font-semibold hover:bg-neutral-100 transition-colors bg-white border border-input shadow-xs hover:shadow-sm w-full"
              onClick={handleVoteStart}
            >
              <Vote className="w-5 h-5 text-gray-600" />
              <span>MVP 투표</span>
            </button>
          ) : (
            <div className="space-y-3">
              <select
                value={selectedMvpId}
                onChange={(e) => setSelectedMvpId(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-white"
              >
                <option value="">MVP를 선택하세요</option>
                {votingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleVoteSave}
                  disabled={voteMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  {voteMutation.isPending ? "저장 중..." : "저장"}
                </button>
                <button
                  type="button"
                  onClick={handleVoteCancel}
                  disabled={voteMutation.isPending}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 font-medium"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {renderMvpSection({ teamType: "host" })}
      {data?.data?.invitedTeam && renderMvpSection({ teamType: "invited" })}
    </div>
  );
};

export default ScheduleMvp;
