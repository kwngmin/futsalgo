"use client";

import { useQuery } from "@tanstack/react-query";
import { getSchedule } from "../actions/get-schedule";
import {
  Calendar,
  ChevronRight,
  CircleCheckBig,
  Clock,
  Flag,
  Loader2,
  MapPin,
  Text,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { useSession } from "next-auth/react";
import TeamLogo from "./TeamLogo";
import { addMatch } from "../actions/add-match";
import { SoccerBallIcon } from "@phosphor-icons/react";

const ScheduleDetails = ({ scheduleId }: { scheduleId: string }) => {
  const router = useRouter();
  const session = useSession();
  const currentUserId = session.data?.user?.id;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["schedule", scheduleId],
    queryFn: () => getSchedule(scheduleId),
  });

  if (!data) {
    return (
      <div className="text-center text-gray-500 pt-10">
        일정 정보를 불러오는 중입니다.
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="text-center text-gray-500 pt-10">
        존재하지 않는 일정입니다.
      </div>
    );
  }

  if (error) {
    console.warn(error, "error");
  }

  console.log(data, "data");

  // const dDay = calculateDday(data.data.schedule?.date as Date);
  const attendanceIds = data.data.schedule.attendances.map((attendance) => {
    return {
      userId: attendance.userId,
    };
  });
  console.log(attendanceIds, "attendances");

  const isTeamMatch = data.data.schedule.matchType === "TEAM";

  return (
    <div className="space-y-3">
      {isLoading && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4 items-center justify-center h-40 w-60 bg-gradient-to-br from-slate-100 to-zinc-100 rounded-lg">
          <Loader2
            className="w-4 h-4 animate-spin"
            style={{ width: "40px", height: "40px", color: "gray" }}
          />
          <div className="text-base text-muted-foreground">로딩 중입니다.</div>
        </div>
      )}

      <div className="relative">
        {/* 공통 */}
        <div className="flex justify-center gap-6 px-4 py-12 sm:max-w-sm mx-auto bg-gradient-to-b from-slate-100 to-transparent sm:from-transparent">
          <TeamLogo
            logoUrl={data.data.schedule?.hostTeam?.logoUrl ?? ""}
            teamType="HOST"
          />
          <div
            className={
              isTeamMatch
                ? "flex flex-col items-center justify-center"
                : "flex flex-col justify-center"
            }
          >
            <span
              className={`flex items-center font-semibold text-xl ${
                isTeamMatch ? "justify-center" : "justify-start"
              }`}
            >
              {isTeamMatch ? "다른 팀과의 친선전" : "우리 팀끼리 자체전"}
              {/* ? "다른 팀과의 친선경기"
              : "우리 팀끼리 자체경기"} */}
            </span>
            <div className="w-full flex justify-center items-center gap-1 tracking-tight text-muted-foreground h-6">
              {data.data.schedule?.startTime?.toLocaleDateString("ko-KR", {
                month: "long",
                day: "numeric",
                weekday: "long",
                hour: "numeric",
                minute: "numeric",
              })}
            </div>
          </div>
          {isTeamMatch && (
            <TeamLogo
              logoUrl={data.data.schedule?.invitedTeam?.logoUrl ?? ""}
              teamType="INVITED"
            />
          )}
        </div>

        {/* 경기 시작 버튼 */}
        {/* <div className="p-4">
      <div className="w-full flex flex-col items-center">
        {data.data.schedule?.status === "PENDING" ? (
          <div className="h-12 w-full flex justify-center items-center text-lg font-semibold bg-muted text-muted-foreground rounded-md">
            초청팀 대전 수락 대기중
          </div>
        ) : data.data.schedule?.status === "REJECTED" ? (
          <div className="h-12 w-full flex justify-center items-center text-lg font-semibold bg-muted text-muted-foreground rounded-md">
            상대팀 대전 거절됨
          </div>
        ) : data.data.schedule?.status === "READY" && dDay > 1 ? (
          <div className="h-12 w-full flex justify-center items-center text-lg bg-amber-500/10 text-amber-700 text-medium rounded-md gap-1.5 tracking-tight">
            경기하는 날까지
            <span className="text-amber-600 font-extrabold">
              {calculateDday(data.data.schedule?.date as Date) > 0
                ? `D-${calculateDday(data.data.schedule?.date as Date)}`
                : "D-day"}
            </span>
          </div>
        ) : data.data.schedule?.status === "READY" && dDay === 1 ? (
          <div className="h-12 w-full flex justify-center items-center text-lg font-semibold bg-muted text-muted-foreground rounded-md">
            내일
          </div>
        ) : data.data.schedule?.status === "READY" && dDay === 0 ? (
          <Button
            className="w-full font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 tracking-tight !h-12 !text-lg"
            size="lg"
          >
            경기 시작
          </Button>
        ) : data.data.schedule?.status === "PLAY" ? (
          <Button
            className="w-full font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 tracking-tight !h-12 !text-lg"
            size="lg"
          >
            경기 종료
          </Button>
        ) : (
          <div className="h-12 bg-muted text-muted-foreground w-full flex justify-center items-center rounded-md font-semibold">
            경기 종료
          </div>
        )}
      </div>
    </div> */}

        {/* 경기 정보 */}
        {data.data.schedule.matches.length > 0 && (
          <div className="space-y-2 mb-2">
            {data.data.schedule.matches.map((match, index) => (
              <div
                className="overflow-hidden rounded-lg border mx-4"
                key={match.id}
              >
                <div
                  className="w-full flex items-center justify-between px-4 h-11 sm:h-10 gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    router.push(`/schedule/${scheduleId}/match/${match.id}`);
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <SoccerBallIcon
                      className="size-5 text-gray-600"
                      weight="fill"
                    />
                    <span className="font-medium">{index + 1}경기</span>
                    {match.durationMinutes && (
                      <span className="text-sm text-gray-500">
                        {match.durationMinutes}분
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-base font-medium text-gray-500">
                      {match.homeScore} - {match.awayScore}
                    </span>
                    <ChevronRight className="size-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 경기 추가 버튼 */}
        {currentUserId && data.data.schedule.createdBy.id === currentUserId && (
          <div className="px-4 py-2">
            <Button
              type="button"
              className="w-full font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 tracking-tight !h-12 !text-lg"
              size="lg"
              onClick={async () => {
                const result = await addMatch(scheduleId);
                if (result.success) {
                  refetch();
                } else {
                  console.log(result.error, "result.error");
                  // toast.error(result.error);
                }
              }}
              // onClick={() => {
              //   router.push(`/schedule/${scheduleId}/match/add`);
              // }}
            >
              경기 추가
            </Button>
          </div>
        )}

        <div className="">
          {/* 안내 사항 */}
          <div>
            <div className="w-full flex items-center justify-between px-4 h-11 sm:h-10 gap-3">
              <div className="flex items-center space-x-2">
                <Text className={`size-5 text-gray-600`} />
                <span className="font-medium">안내 사항</span>
              </div>
              {!Boolean(data?.data.schedule?.description) && (
                <span className="text-base font-medium text-gray-500">
                  없음
                </span>
              )}
            </div>
            {Boolean(data?.data.schedule?.description) && (
              <p className="mx-4 border p-4 bg-white rounded-2xl min-h-40 whitespace-pre-line mb-3 break-words">
                {data?.data.schedule?.description ?? "안내 사항 없음"}
              </p>
            )}
          </div>

          {/* 장소 이름 */}
          <div className="w-full flex items-center justify-between px-4 h-11 sm:h-10 border-t border-gray-100 gap-3">
            <div className="flex items-center space-x-2">
              <MapPin className="size-5 text-gray-600" />
              <span className="font-medium">장소</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-base font-medium text-gray-500">
                {data.data.schedule?.place}
              </span>
            </div>
          </div>

          {/* 경기 일자 */}
          <div className="w-full flex items-center justify-between px-4 h-11 sm:h-10 border-t border-gray-100 gap-3">
            <div className="flex items-center space-x-2">
              <Calendar className="size-5 text-gray-600" />
              <span className="font-medium">일자</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-base font-medium text-gray-500">
                {data.data.schedule?.startTime?.toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* 예약 시간 */}
          <div className="w-full flex items-center justify-between px-4 h-11 sm:h-10 border-t border-gray-100 gap-3">
            <div className="flex items-center space-x-2">
              <Clock className="size-5 text-gray-600" />
              <span className="font-medium">시간</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-base font-medium text-gray-500">
                {data.data.schedule?.startTime?.toLocaleTimeString("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -{" "}
                {data.data.schedule?.endTime?.toLocaleTimeString("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* 주최팀 */}
          <div
            className="w-full flex items-center justify-between px-4 h-11 sm:h-10 border-t border-gray-100 gap-3 cursor-pointer  hover:bg-gray-50 transition-colors"
            onClick={() => {
              router.push(`/teams/${data.data.schedule?.hostTeam.id}`);
            }}
          >
            <div className="flex items-center space-x-2">
              <Flag className="size-5 text-gray-600" />
              <span className="font-medium">주최팀</span>
            </div>
            <div className="flex items-center gap-1">
              <Image
                src={data.data.schedule?.hostTeam.logoUrl ?? ""}
                alt="avatar"
                width={24}
                height={24}
                className="rounded-lg"
              />
              <span className="text-base font-medium text-gray-500">
                {data.data.schedule?.hostTeam?.name}
              </span>
              <ChevronRight className="size-5 text-gray-400" />
            </div>
          </div>

          {/* 초청팀 */}
          {data.data.schedule.invitedTeam && (
            <div
              className="w-full flex items-center justify-between px-4 h-11 sm:h-10 border-t border-gray-100 gap-3 cursor-pointer  hover:bg-gray-50 transition-colors"
              onClick={() => {
                router.push(`/teams/${data.data.schedule?.invitedTeamId}`);
              }}
            >
              <div className="flex items-center space-x-2">
                <CircleCheckBig className="size-5 text-gray-600" />
                <span className="font-medium">초청팀</span>
              </div>
              <div className="flex items-center gap-1">
                <Image
                  src={data.data.schedule?.invitedTeam.logoUrl ?? ""}
                  alt="avatar"
                  width={24}
                  height={24}
                  className="rounded-lg"
                />
                <span className="text-base font-medium text-gray-500">
                  {data.data.schedule?.invitedTeam?.name}
                </span>
                <ChevronRight className="size-5 text-gray-400" />
              </div>
            </div>
          )}

          {/* 만든이 */}
          <div
            className="w-full flex items-center justify-between px-4 h-11 sm:h-10 border-t border-gray-100 gap-3 cursor-pointer  hover:bg-gray-50 transition-colors"
            onClick={() => {
              router.push(`/players/${data.data.schedule?.createdBy.id}`);
            }}
          >
            <div className="flex items-center space-x-2">
              <UserRound className="size-5 text-gray-600" />
              <span className="font-medium">만든이</span>
            </div>
            <div className="flex items-center gap-1">
              <Image
                src={data.data.schedule?.createdBy.image ?? ""}
                alt="avatar"
                width={24}
                height={24}
                className="rounded-lg mr-1"
              />
              <span className="text-base font-medium text-gray-500">
                {data.data.schedule?.createdBy.nickname}
              </span>
              <ChevronRight className="size-5 text-gray-400" />
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          만든 날짜:{" "}
          {data?.data?.schedule?.startTime
            ? new Date(data?.data?.schedule?.startTime).toLocaleDateString(
                "ko-KR",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )
            : ""}
        </p>
      </div>
      {/* 팀원 */}
      {/* {selectedTab === "members" && (
    <TeamMemberList
      members={data.data.members}
      isMember={data.data.currentUserMembership.isMember}
      role={data.data.currentUserMembership.role}
      status={data.data.currentUserMembership.status}
      refetch={refetch}
      teamId={id}
    />
  )} */}
    </div>
  );
};

export default ScheduleDetails;
