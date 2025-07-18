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
  Text,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/shared/components/ui/button";
import { MapPinSimpleIcon, SoccerBallIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { calculateDday } from "./ScheduleContent";
// import { useState } from "react";

const ScheduleDetails = ({ scheduleId }: { scheduleId: string }) => {
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ["schedule", scheduleId],
    queryFn: () => getSchedule(scheduleId),
  });
  console.warn(error, "error");

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

  const dDay = calculateDday(data.data.schedule?.date as Date);

  return (
    <div className="space-y-3">
      {isLoading && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4 items-center justify-center h-40 w-60 bg-gradient-to-br from-slate-100 to-zinc-100 backdrop-blur-lg rounded-lg">
          <Loader2
            className="w-4 h-4 animate-spin"
            style={{ width: "40px", height: "40px", color: "gray" }}
          />
          <div className="text-base text-muted-foreground">로딩 중입니다.</div>
        </div>
      )}
      {/* 우리팀 & 주최팀vs초청팀 로고 */}
      {data?.data?.schedule?.matchType === "SQUAD" ? (
        <div className="w-full flex flex-col items-center pt-6 pb-3 bg-gradient-to-b from-slate-100 to-transparent">
          <Image
            src={data.data.schedule?.hostTeam?.logoUrl ?? ""}
            alt="hostTeamLogo"
            width={100}
            height={100}
            className="size-20 mt-4"
          />
          <span className="sm:text-lg font-semibold">
            {data.data.schedule?.hostTeam?.name}
          </span>
        </div>
      ) : (
        <div className="w-full flex items-center justify-center gap-3 pt-6 pb-3 bg-gradient-to-b from-slate-100 to-transparent px-4">
          <div className="grow flex flex-col items-center w-28 sm:w-36 max-w-40">
            <Image
              src={data.data.schedule?.hostTeam?.logoUrl ?? ""}
              alt="hostTeamLogo"
              width={100}
              height={100}
              className="size-20 mt-4"
            />
            <span className="sm:text-lg font-semibold text-center">
              {data.data.schedule?.hostTeam?.name}
            </span>
          </div>
          <span className="text-2xl font-bold">VS</span>
          <div className="grow flex flex-col items-center w-28 sm:w-36 max-w-40">
            <Image
              src={data.data.schedule?.invitedTeam?.logoUrl ?? ""}
              alt="guestTeamLogo"
              width={100}
              height={100}
              className="size-20 mt-4"
            />
            <span className="sm:text-lg font-semibold">
              {data.data.schedule?.invitedTeam?.name}
            </span>
          </div>
        </div>
      )}

      {/* 경기 일정 탭*/}
      <div className="relative border-b border-gray-300">
        {/* 참가팀 정보 */}
        <div className="flex p-4 gap-24 sm:gap-3 mb-8">
          {/* 공통 */}
          <div className="w-full flex flex-col items-center justify-center">
            <span className="flex items-center justify-center font-semibold text-xl sm:text-2xl tracking-tight">
              {data.data.schedule?.matchType === "TEAM"
                ? "다른 팀과의 친선경기"
                : "우리 팀끼리 연습경기"}
            </span>
            <div className="w-full flex justify-center items-center gap-1">
              {data.data.schedule?.startTime?.toLocaleDateString("ko-KR", {
                month: "long",
                day: "numeric",
                weekday: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>

        {/* 경기 정보 */}
        <div className="space-y-2">
          <div className="overflow-hidden rounded-lg border mx-4">
            <div
              className="w-full flex items-center justify-between px-4 h-11 sm:h-10 gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => {
                router.push(`/players/${data.data.schedule?.createdBy.id}`);
              }}
            >
              <div className="flex items-center space-x-2">
                {/* <CourtBasketballIcon
            className="w-5 h-5 text-gray-600"
            // weight="fill"
          /> */}
                <SoccerBallIcon
                  className="w-5 h-5 text-gray-600"
                  weight="fill"
                />
                <span className="font-medium">1 경기</span>
                <span className="text-sm text-gray-500">15분</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-base font-medium text-gray-500">
                  0 - 0
                </span>
                <ChevronRight className="size-5 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border mx-4">
            <div
              className="w-full flex items-center justify-between px-4 h-11 sm:h-10 gap-3 cursor-pointer  hover:bg-gray-50 transition-colors"
              onClick={() => {
                router.push(`/players/${data.data.schedule?.createdBy.id}`);
              }}
            >
              <div className="flex items-center space-x-2">
                {/* <CourtBasketballIcon
            className="w-5 h-5 text-gray-600"
            // weight="fill"
          /> */}
                <SoccerBallIcon
                  className="w-5 h-5 text-gray-600"
                  weight="fill"
                />
                <span className="font-medium">2 경기</span>
                <span className="text-sm text-gray-500">15분</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-base font-medium text-gray-500">
                  0 - 0
                </span>
                <ChevronRight className="size-5 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border mx-4">
            <div
              className="w-full flex items-center justify-between px-4 h-11 sm:h-10 gap-3 cursor-pointer  hover:bg-gray-50 transition-colors"
              onClick={() => {
                router.push(`/players/${data.data.schedule?.createdBy.id}`);
              }}
            >
              <div className="flex items-center space-x-2">
                {/* <CourtBasketballIcon
            className="w-5 h-5 text-gray-600"
            // weight="fill"
          /> */}
                <SoccerBallIcon
                  className="w-5 h-5 text-gray-600"
                  weight="fill"
                />
                <span className="font-medium">3 경기</span>
                <span className="text-sm text-gray-500">15분</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-base font-medium text-gray-500">
                  0 - 0
                </span>
                <ChevronRight className="size-5 text-gray-400" />
              </div>
            </div>
          </div>
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

        {/* 경기 추가 */}
        {dDay >= 0 && (
          <div className="px-4 py-2 mb-2">
            <Button
              className="w-full font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 tracking-tight !h-12 !text-lg"
              size="lg"
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
                <Text className={`w-5 h-5 text-gray-600`} />
                <span className="font-medium">안내 사항</span>
              </div>
              {!Boolean(data?.data.schedule?.description) && (
                <span className="text-base font-medium text-gray-500">
                  없음
                </span>
              )}
            </div>
            {Boolean(data?.data.schedule?.description) && (
              <p className="mx-4 border p-4 bg-white rounded-2xl min-h-40 whitespace-pre-line mb-3">
                {data?.data.schedule?.description ?? "안내 사항 없음"}
              </p>
            )}
          </div>

          {/* 장소 이름 */}
          <div className="w-full flex items-center justify-between px-4 h-11 sm:h-10 border-t border-gray-100 gap-3">
            <div className="flex items-center space-x-2">
              <MapPinSimpleIcon
                className="text-gray-600"
                size={20}
                weight="fill"
              />
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
              <Calendar className="w-5 h-5 text-gray-600" />
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
              <Clock className="w-5 h-5 text-gray-600" />
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
              <Flag className="w-5 h-5 text-gray-600" />
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
                <CircleCheckBig className="w-5 h-5 text-gray-600" />
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
              <UserRound className="w-5 h-5 text-gray-600" />
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
