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
// import { AttendanceStatus } from "@prisma/client";
import { Label } from "@/shared/components/ui/label";
import { ChevronDown, Vote } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { CrownIcon } from "@phosphor-icons/react";

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

  // 전체 참석자를 투표 수 기준으로 정렬 (표 받은 사람만)
  const sortedAttendances = useMemo(() => {
    const attendances =
      data?.data?.attendances.filter(
        (attendance) => attendance.mvpReceived > 0
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
  }, [data?.data?.attendances]);

  // 투표 옵션 (자신 제외한 모든 참석자)
  const votingOptions = useMemo(() => {
    const allAttendances = data?.data?.attendances || [];
    const currentUserId = data?.data?.currentUserAttendance?.userId;
    const isCurrentUserAttending = data?.data?.isCurrentUserAttending;

    return allAttendances
      .filter((att) => att.user.id !== currentUserId) // 자신 제외
      .map((att) => ({
        value: att.user.id,
        label: isCurrentUserAttending
          ? `${att.user.nickname || "익명"}${
              att.user.name ? ` (${att.user.name})` : ""
            }`
          : att.user.nickname || "익명",
      }));
  }, [
    data?.data?.attendances,
    data?.data?.currentUserAttendance?.userId,
    data?.data?.isCurrentUserAttending,
  ]);

  // 전체 MVP 투표 통계 계산
  const mvpStats = useMemo(() => {
    if (!data?.data) return { voted: 0, notVoted: 0, voteRate: 0 };

    const hostStats = data.data.mvpStats?.host || {
      voted: 0,
      notVoted: 0,
      voteRate: 0,
    };
    const invitedStats = data.data.mvpStats?.invited || {
      voted: 0,
      notVoted: 0,
      voteRate: 0,
    };

    const voted = hostStats.voted + invitedStats.voted;
    const notVoted = hostStats.notVoted + invitedStats.notVoted;
    const total = voted + notVoted;
    const voteRate = total > 0 ? Math.round((voted / total) * 100) : 0;

    return { voted, notVoted, voteRate };
  }, [data?.data?.mvpStats]);

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
      <div className="h-[138px] rounded-2xl bg-neutral-100 animate-pulse my-2" />
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

  if (isLoading) {
    return renderLoadingSkeleton();
  }

  return (
    <div className="px-4">
      <div className="flex justify-between items-center py-2 min-h-13">
        <div className="flex items-center gap-2">
          <CrownIcon //
            weight="fill"
            // weight="light"
            // weight="duotone"
            className="size-7 text-yellow-500"
          />
          <h2 className="text-xl font-semibold">MVP</h2>
        </div>
      </div>

      {/* MVP 투표 버튼 */}
      {data?.data?.manageableTeams && data?.data?.currentUserAttendance && (
        <div className="">
          {!isVoting ? (
            <button
              type="button"
              className="cursor-pointer rounded-md flex justify-center items-center gap-2 px-4 h-12 sm:h-11 font-semibold bg-white border border-gray-400 transition-shadow shadow-xs hover:shadow-md w-full mb-3"
              onClick={handleVoteStart}
            >
              <Vote className="w-5 h-5 text-gray-600" />
              <span>투표하기</span>
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-slate-100 rounded-2xl p-3 sm:px-4 select-none mb-3">
              <div className="flex items-center gap-2 grow">
                <div className="relative w-full">
                  <select
                    value={selectedMvpId}
                    onChange={(e) => setSelectedMvpId(e.target.value)}
                    className="w-full px-3 py-2 h-12 sm:h-10 border border-input rounded-md bg-white appearance-none"
                  >
                    <option value="">MVP를 선택하세요</option>
                    {votingOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
                </div>
              </div>
              <div className="w-full sm:w-48 shrink-0 flex items-center *:cursor-pointer gap-1.5 ">
                <button
                  type="button"
                  onClick={handleVoteSave}
                  className="grow h-11 sm:h-9 font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:bg-blue-800 rounded-sm active:scale-95 transition-all duration-200"
                  disabled={voteMutation.isPending}
                >
                  {voteMutation.isPending ? "저장 중..." : "저장"}
                </button>
                <button
                  type="button"
                  className="grow h-11 sm:h-9 font-medium text-gray-700 bg-blue-900/10 hover:bg-blue-900/15 hover:text-gray-800 rounded-sm active:scale-95 transition-all duration-200"
                  onClick={handleVoteCancel}
                  disabled={voteMutation.isPending}
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 통합 MVP 투표 현황 */}
      <div className="">
        <div className="bg-neutral-100 overflow-hidden rounded-2xl mb-2">
          {/* MVP 투표 현황 */}
          <div className="grid grid-cols-3 gap-3 px-4 py-4 mb-1">
            <div className="flex flex-col gap-1 items-center my-2">
              <div className="font-semibold">
                {mvpStats.voted === 0 ? "-" : `${mvpStats.voted}`}
              </div>
              <Label className="text-muted-foreground">투표완료</Label>
            </div>
            <div className="flex flex-col gap-1 items-center my-2">
              <div className="font-semibold">
                {mvpStats.notVoted === 0 ? "-" : `${mvpStats.notVoted}`}
              </div>
              <Label className="text-muted-foreground">미투표</Label>
            </div>
            <div className="flex flex-col gap-1 items-center my-2">
              <div className="font-semibold">{mvpStats.voteRate || 0}%</div>
              <Label className="text-muted-foreground">투표율</Label>
            </div>
          </div>
        </div>

        {/* MVP 투표 결과 목록 (표 받은 사람만) */}
        {
          sortedAttendances.length > 0
            ? sortedAttendances.map((attendance) => (
                <div
                  key={attendance.user.id}
                  className="flex items-center justify-between h-12 border-b border-gray-100 last:border-b-0 select-none px-4"
                >
                  <div
                    className="flex items-center gap-2"
                    onClick={() => {
                      router.push(`/players/${attendance.user.id}`);
                    }}
                  >
                    {attendance.user.image ? (
                      <Image
                        src={attendance.user.image}
                        alt="user_image"
                        width={32}
                        height={32}
                        className="rounded-full object-cover size-8 border"
                      />
                    ) : (
                      <div className="size-8 rounded-full bg-gray-200" />
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-medium hover:underline underline-offset-2 cursor-pointer">
                        {attendance.user.nickname || "익명"}
                      </span>
                      {attendance.user.name && (
                        <span className="text-sm font-medium text-gray-500">
                          {attendance.user.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="font-medium mx-2 text-emerald-600">
                    {attendance.mvpReceived}표
                  </span>
                </div>
              ))
            : null
          // <div className="flex items-center justify-center h-40 text-muted-foreground">
          //   아직 MVP 투표가 없습니다.
          // </div>
        }
      </div>
    </div>
  );
};

export default ScheduleMvp;
