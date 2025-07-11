"use client";

import { useQuery } from "@tanstack/react-query";
import { getSchedule } from "../actions/get-schedule";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Clock,
  EllipsisVertical,
  // Info,
  Loader2,
  Share,
  Text,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MATCH_TYPE } from "@/entities/team/model/constants";
import { Countdown } from "./CountDown";
import { Button } from "@/shared/components/ui/button";
import { MapPinSimpleIcon } from "@phosphor-icons/react";

/**
 * @param date YYYY-MM-DD 형식의 날짜 문자열
 * @returns D-day 숫자 (예: D-3이면 3, 오늘이면 0, 지났으면 음수)
 */
export function calculateDday(date: Date): number {
  const today = new Date();
  const targetDate = new Date(date);

  // 시차 보정: 시간을 00:00:00으로 맞춰줌 (UTC 문제 방지)
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  const diffMs = targetDate.getTime() - today.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
}

const ScheduleContent = ({ scheduleId }: { scheduleId: string }) => {
  const router = useRouter();
  const { data, isLoading, error } = useQuery({
    queryKey: ["schedule", scheduleId],
    queryFn: () => getSchedule(scheduleId),
  });
  console.log(data, "data");
  console.log(scheduleId, "scheduleId");
  console.log(error, "error");

  const handleGoBack = () => {
    router.back();
  };

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

  // const timeRange = formatTimeRange({
  //   time: {
  //     start: data.data.schedule?.startTime as Date,
  //     end: data.data.schedule?.endTime as Date,
  //   },
  // });

  const opposingTeam =
    data.data.schedule?.matchType === "SQUAD"
      ? data.data.schedule.hostTeam
      : data.data.schedule?.guestTeam;

  const dDay = calculateDday(data.data.schedule?.date as Date);
  const timeString = data.data.schedule?.startTime?.toLocaleTimeString(
    "ko-KR",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const [period, time] = timeString?.split(" ") || [];

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {isLoading && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4 items-center justify-center h-40 w-60 bg-gradient-to-br from-slate-100 to-zinc-100 backdrop-blur-lg rounded-lg">
          <Loader2
            className="w-4 h-4 animate-spin"
            style={{ width: "40px", height: "40px", color: "gray" }}
          />
          <div className="text-base text-muted-foreground">로딩 중입니다.</div>
        </div>
      )}
      {/* 상단: 뒤로 가기와 공유하기, 더보기 버튼 */}
      <div className="grid grid-cols-3 items-center shrink-0 px-3 h-16">
        <button className="shrink-0 size-10 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
          <ArrowLeft
            style={{ width: "24px", height: "24px" }}
            onClick={handleGoBack}
          />
        </button>
        <span className="text-center font-bold">
          {/* {data?.data?.schedule?.place} */}
          {
            MATCH_TYPE[
              data?.data?.schedule?.matchType as keyof typeof MATCH_TYPE
            ]
          }
        </span>
        <div className="flex items-center justify-end gap-2">
          <button className="shrink-0 size-10 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <Share className="w-5 h-5" />
          </button>
          <button className="shrink-0 size-10 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <EllipsisVertical className="size-5" />
          </button>
        </div>
      </div>
      {data ? (
        <div className="space-y-3">
          {/* 일정 정보 */}
          <div className="relative">
            {/* <div className="flex justify-between items-center px-3 h-10 border-b">
              <div className="flex items-center">
                <MapPinSimpleIcon
                  className="text-gray-600 mr-2"
                  size={20}
                  weight="fill"
                />
                <span className="font-bold">{data?.data?.schedule?.place}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="text-sm font-semibold">
                  {
                    MATCH_TYPE[
                      data?.data?.schedule?.matchType as keyof typeof MATCH_TYPE
                    ]
                  }
                </span>
                <Info className="size-4" />
              </div>
            </div> */}
            {/* 팀 정보 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 px-4 gap-28 sm:gap-3 relative">
              {/* 호스트 팀 */}
              <div className="flex flex-col items-center hover:ring py-8 sm:py-10 rounded-lg hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <span className="text-slate-500 sm:text-lg tracking-tight mb-6">
                  호스트 팀
                </span>
                {data?.data?.schedule?.hostTeam?.logoUrl ? (
                  <div className="">
                    <Image
                      src={data?.data?.schedule?.hostTeam?.logoUrl}
                      alt="logo"
                      width={64}
                      height={64}
                    />
                  </div>
                ) : (
                  <div className="">
                    {data?.data?.schedule?.hostTeam?.name.charAt(0)}
                  </div>
                )}
                <span className="font-semibold">
                  {data?.data?.schedule?.hostTeam?.name}
                </span>
              </div>
              {/* 데스크탑 공통 */}
              <div className="hidden sm:flex flex-col items-center justify-center">
                <span className="hidden sm:h-10 sm:flex items-center justify-center font-semibold text-xl sm:text-3xl tracking-tight">
                  {data.data.schedule?.startTime?.toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <div className="w-full flex flex-col items-center">
                  {data.data.schedule?.status === "PENDING" ? (
                    <div>상대팀 대전신청 대기중</div>
                  ) : data.data.schedule?.status === "REJECTED" ? (
                    <div>상대팀 대전신청 거절됨</div>
                  ) : data.data.schedule?.status === "READY" ? (
                    <button
                      className={`flex items-center gap-1 text-lg font-medium tracking-tight ${
                        dDay > 0 ? "text-muted-foreground" : "bg-green-600"
                      }`}
                    >
                      {dDay > 1 ? (
                        data.data.schedule.startTime?.toLocaleDateString(
                          "ko-KR",
                          {
                            // year: "numeric",
                            // weekday: "long",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      ) : dDay === 1 ? (
                        "내일"
                      ) : dDay === 0 ? (
                        <Countdown
                          date={data.data.schedule.startTime as Date}
                        />
                      ) : (
                        "경기 종료"
                      )}
                    </button>
                  ) : data.data.schedule?.status === "PLAY" ? (
                    <div>경기중</div>
                  ) : (
                    <div>경기 종료</div>
                  )}
                  {/* <span>
                {calculateDday(data.data.schedule?.date as Date) > 0
                  ? `D-${calculateDday(data.data.schedule?.date as Date)}`
                  : "D-day"}
              </span> */}
                </div>
                {/* <span>{timeRange}</span> */}
                {/* <span>
                  {data?.data?.schedule?.date?.toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="">{timeRange}</span> */}
                {/* <div className="h-16 flex items-center justify-center font-extrabold text-3xl text-muted-foreground">
                  VS
                </div> */}
              </div>
              {/* 모바일 공통 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:hidden flex flex-col items-center justify-center">
                <span className="h-6 flex items-center justify-center font-semibold text-lg tracking-tight">
                  {period}
                </span>
                <span className="h-8 flex items-center justify-center font-semibold text-2xl tracking-tight">
                  {time}
                </span>
                <div className="w-full flex flex-col items-center">
                  {data.data.schedule?.status === "PENDING" ? (
                    <div>상대팀 대전신청 대기중</div>
                  ) : data.data.schedule?.status === "REJECTED" ? (
                    <div>상대팀 대전신청 거절됨</div>
                  ) : data.data.schedule?.status === "READY" ? (
                    <button
                      className={`flex items-center gap-1 text-lg font tracking-tight ${
                        dDay > 0 ? "text-muted-foreground" : "bg-green-600"
                      }`}
                    >
                      {dDay > 1 ? (
                        data.data.schedule.startTime?.toLocaleDateString(
                          "ko-KR",
                          {
                            // year: "numeric",
                            // weekday: "long",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      ) : dDay === 1 ? (
                        "내일"
                      ) : dDay === 0 ? (
                        <Countdown
                          date={data.data.schedule.startTime as Date}
                        />
                      ) : (
                        "경기 종료"
                      )}
                    </button>
                  ) : data.data.schedule?.status === "PLAY" ? (
                    <div>경기중</div>
                  ) : (
                    <div>경기 종료</div>
                  )}
                  {/* <span>
                {calculateDday(data.data.schedule?.date as Date) > 0
                  ? `D-${calculateDday(data.data.schedule?.date as Date)}`
                  : "D-day"}
              </span> */}
                </div>
                {/* <span>{timeRange}</span> */}
                {/* <span>
                  {data?.data?.schedule?.date?.toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="">{timeRange}</span> */}
                {/* <div className="h-16 flex items-center justify-center font-extrabold text-3xl text-muted-foreground">
                  VS
                </div> */}
              </div>
              {/* 상대 팀 */}
              <div className="flex flex-col items-center hover:ring py-8 sm:py-10 rounded-lg hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <span className="text-slate-500 sm:text-lg tracking-tight mb-6">
                  상대 팀
                </span>
                {opposingTeam?.logoUrl ? (
                  <div className="">
                    <Image
                      src={opposingTeam?.logoUrl}
                      alt="logo"
                      width={64}
                      height={64}
                    />
                  </div>
                ) : (
                  <div className="">{opposingTeam?.name.charAt(0)}</div>
                )}
                <span className="font-semibold">{opposingTeam?.name}</span>
              </div>
            </div>

            <div className="p-4">
              <Button
                // className="w-full text-base font-semibold bg-indigo-700"
                className="w-full font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 tracking-tight !h-12 !text-lg"
                size="lg"
                // onClick={async () => {
                //   if (session.data) {
                //     try {
                //       const result = await joinTeam(id);
                //       console.log(result);
                //       if (result?.success) {
                //         alert("가입 신청이 완료되었습니다.");
                //         refetch();
                //       } else {
                //         alert(result?.error);
                //       }
                //     } catch (error) {
                //       console.error(error);
                //       alert("가입 신청에 실패했습니다.");
                //     }
                //   } else {
                //     alert("로그인이 필요합니다.");
                //     signIn();
                //   }
                // }}
              >
                경기 시작
              </Button>
            </div>

            {/* <div className="flex items-center gap-4 px-6 h-20">
              <div className="flex flex-col">
                <div className="flex items-center gap-1 h-6">
                  <span className="sm:text-sm font-medium text-muted-foreground tracking-tight"></span>
                </div>
              </div>
            </div> */}
            {/* <div className="p-3">
              {data.data.currentUserMembership.role === "MANAGER" ||
              data.data.currentUserMembership.role === "OWNER" ? (
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full text-base font-semibold cursor-pointer"
                  onClick={() => {
                    setIsLoading(true);
                    router.push(`/edit-team/${id}`);
                  }}
                >
                  팀 정보 수정
                </Button>
              ) : !data.data.currentUserMembership.isMember ? (
                data.data.recruitmentStatus === "RECRUITING" ? (
                  <Button
                    className="w-full text-base font-semibold bg-gradient-to-r from-indigo-600 to-emerald-600"
                    size="lg"
                    onClick={async () => {
                      if (session.data) {
                        try {
                          const result = await joinTeam(id);
                          console.log(result);
                          if (result?.success) {
                            alert("가입 신청이 완료되었습니다.");
                            refetch();
                          } else {
                            alert(result?.error);
                          }
                        } catch (error) {
                          console.error(error);
                          alert("가입 신청에 실패했습니다.");
                        }
                      } else {
                        alert("로그인이 필요합니다.");
                        signIn();
                      }
                    }}
                  >
                    가입 신청
                  </Button>
                ) : null
              ) : data.data.currentUserMembership.status === "PENDING" ? (
                <Button
                  className="w-full text-base font-semibold"
                  size="lg"
                  variant="outline"
                  onClick={async () => {
                    try {
                      const result = await cancelJoinTeam(id);
                      console.log(result);
                      if (result?.success) {
                        alert("가입 신청이 취소되었습니다.");
                        refetch();
                      } else {
                        alert(result?.error);
                      }
                    } catch (error) {
                      console.error(error);
                      alert("가입 신청 취소에 실패했습니다.");
                    }
                  }}
                >
                  가입신청 취소
                </Button>
              ) : (
                data.data.currentUserMembership.status === "REJECTED" && (
                  <div className="flex items-center justify-between bg-red-400/10 rounded-lg p-2">
                    <div className="flex items-center px-2">
                      <CircleX className="w-5 h-5 text-red-600 mr-3" />
                      <span className="font-medium text-red-600">
                        가입 신청이 거절되었습니다.
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        className="text-sm font-semibold"
                        variant="outline"
                        size="sm"
                      >
                        거절 사유보기
                      </Button>
                      <Button
                        className="text-sm font-semibold text-white bg-indigo-700"
                        size="sm"
                      >
                        재가입 신청하기
                      </Button>
                    </div>
                  </div>
                )
              )}
            </div> */}
          </div>

          <div className="">
            {/* 장소 이름 */}
            <div className="w-full flex items-center justify-between px-4 py-3 gap-3">
              <div className="flex items-center space-x-3">
                <MapPinSimpleIcon
                  className="text-gray-600 mr-3"
                  size={20}
                  weight="fill"
                />
                <span className="font-medium">장소 이름</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-base font-medium text-gray-500">
                  {data.data.schedule?.place}
                </span>
              </div>
            </div>

            {/* 경기 일자 */}
            <div className="w-full flex items-center justify-between px-4 py-3 border-t gap-3">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-600" />
                <span className="font-medium">경기 일자</span>
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
            <div className="w-full flex items-center justify-between px-4 py-3 border-t gap-3">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="font-medium">예약 시간</span>
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

            {/* 안내 사항 */}
            <div className="border-t mb-6">
              <div className="w-full flex items-center justify-start px-4 py-3 border-b border-gray-100 space-x-3">
                <Text className={`w-5 h-5 text-gray-600`} />
                <span className="font-medium">안내 사항</span>
              </div>
              <p className="px-4 py-4 bg-white rounded-2xl">
                {data?.data.schedule?.description ?? "안내 사항 없음"}
              </p>
            </div>

            {/* 만든이 */}
            <div
              className="w-full flex items-center justify-between px-4 py-3 border-t gap-3 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
              onClick={() => {
                router.push(`/players/${data.data.schedule?.createdBy.id}`);
              }}
            >
              <div className="flex items-center space-x-3">
                <UserRound className="w-5 h-5 text-gray-600" />
                <span className="font-medium">만든이</span>
              </div>
              <div className="flex items-center gap-1">
                <Image
                  src={data.data.schedule?.createdBy.image ?? ""}
                  alt="profile"
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

          <p className="text-center text-sm text-gray-500 mt-3">
            일정 만든 날짜:{" "}
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

          {/* 개요 */}
          {/* {selectedTab === "overview" && (
            <Fragment>
              <div className="bg-white rounded-2xl pb-3">
                <div className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 gap-3">
                  <div className="flex items-center space-x-3">
                    <BookText className={`w-5 h-5 text-gray-600`} />
                    <span className="font-medium">기본 정보</span>
                  </div>
                  <Info
                    className="size-5 text-indigo-600 cursor-pointer active:scale-98 transition-transform"
                    onClick={() => {
                      alert("기본 정보");
                    }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3 px-4 py-2 bg-white rounded-2xl">
                  <div className="flex flex-col gap-1 items-center my-3">
                    <div className="font-semibold">
                      {
                        TEAM_GENDER[
                          data?.data?.gender as keyof typeof TEAM_GENDER
                        ]
                      }
                    </div>
                    <Label className="text-muted-foreground">구분</Label>
                  </div>
                  <div className="flex flex-col gap-1 items-center my-3">
                    <div className="font-semibold">
                      {data.data.stats.professionalCount
                        ? `${data.data.stats.professionalCount}명`
                        : "없음"}
                    </div>
                    <Label className="text-muted-foreground">선수 출신</Label>
                  </div>
                  <div className="flex flex-col gap-1 items-center my-3">
                    <div className="font-semibold">
                      {data.data.members.approved.length}명
                    </div>
                    <Label className="text-muted-foreground">팀원</Label>
                  </div>
                  <div className="flex flex-col gap-1 items-center my-3">
                    <div className="font-semibold">
                      {data.data.stats.averageAge}살
                    </div>
                    <Label className="text-muted-foreground">평균 연령</Label>
                  </div>
                  <div className="flex flex-col gap-1 items-center my-3">
                    <div className="font-semibold">
                      {data.data.stats.averageHeight}cm
                    </div>
                    <Label className="text-muted-foreground">평균 키</Label>
                  </div>
                  <div className="flex flex-col gap-1 items-center my-3">
                    <div className="font-semibold">
           
                      {TEAM_LEVEL[data?.data?.level as keyof typeof TEAM_LEVEL]}
                    </div>
                    <Label className="text-muted-foreground">실력</Label>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl pb-3">
                <div className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 gap-3">
                  <div className="flex items-center space-x-3">
                    <ChartPie className={`w-5 h-5 text-gray-600`} />
                    <span className="font-medium">팀원 실력</span>
                  </div>
                  <Info
                    className="size-5 text-indigo-600 cursor-pointer active:scale-98 transition-transform"
                    onClick={() => {
                      alert("팀원 실력");
                    }}
                  />
                </div>
                <div className="grid grid-cols-4 gap-3 bg-white rounded-2xl p-4">
                  <div className="flex flex-col gap-1 items-center my-3">
                    <div className="font-semibold">
                      {data.data.stats.beginnerCount
                        ? `${data.data.stats.beginnerCount}명`
                        : "없음"}
                    </div>
                    <Label className="text-muted-foreground">스타터</Label>
                  </div>
                  <div className="flex flex-col gap-1 items-center my-3">
                    <div className="font-semibold">
                      {data.data.stats.amateurCount
                        ? `${data.data.stats.amateurCount}명`
                        : "없음"}
                    </div>
                    <Label className="text-muted-foreground">아마추어</Label>
                  </div>
                  <div className="flex flex-col gap-1 items-center my-3">
                    <div className="font-semibold">
                      {data.data.stats.aceCount
                        ? `${data.data.stats.aceCount}명`
                        : "없음"}
                    </div>
                    <Label className="text-muted-foreground">에이스</Label>
                  </div>
                  <div className="flex flex-col gap-1 items-center my-3">
                    <div className="font-semibold">
                      {data.data.stats.semiproCount
                        ? `${data.data.stats.semiproCount}명`
                        : "없음"}
                    </div>
                    <Label className="text-muted-foreground">세미프로</Label>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl pb-3">
                <div className="w-full flex items-center justify-start px-4 py-3 border-b border-gray-100 space-x-3">
                  <Text className={`w-5 h-5 text-gray-600`} />
                  <span className="font-medium">소개</span>
                </div>
                <p className="px-4 py-4 bg-white rounded-2xl">
                  {data?.data?.description ?? "소개 없음"}
                </p>
              </div>
            </Fragment>
          )} */}
        </div>
      ) : null}
    </div>
  );
};

export default ScheduleContent;
