"use client";

import { Button } from "@/shared/components/ui/button";
import { cancelJoinTeam, getTeam, joinTeam } from "../model/actions";
import { followTeam } from "../actions/follow-team"; // 새로 추가한 액션 import
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarCheck2,
  Calendar,
  ChartPie,
  CircleX,
  Hash,
  Loader2,
  MapPinned,
  ScrollText,
  Share,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { Label } from "@/shared/components/ui/label";
import {
  TEAM_GENDER,
  // TEAM_LEVEL,
  TEAM_LEVEL_DESCRIPTION,
} from "@/entities/team/model/constants";
import { Fragment, useState } from "react";
import TeamMemberList from "./TeamMemberList";
import TeamPhotosGallery from "./TeamPhotosGallery";
import TeamSchedules from "./TeamSchedules";

const tabs = [
  {
    label: "프로필",
    value: "overview",
    isDisabled: false,
  },
  {
    label: "팀원",
    value: "members",
    isDisabled: false,
  },
  {
    label: "경기일정",
    value: "matches",
    isDisabled: false,
  },
  {
    label: "사진",
    value: "photos",
    isDisabled: false,
  },
  // {
  //   label: "통계",
  //   value: "statistics",
  //   isDisabled: true,
  // },
];

const TeamContent = ({ id }: { id: string }) => {
  const router = useRouter();
  const session = useSession();
  const [selectedTab, setSelectedTab] = useState<string>(tabs[0].value);
  const [isLoading, setIsLoading] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ["team", id],
    queryFn: () => getTeam(id),
    placeholderData: keepPreviousData,
    enabled: !!id, // id 없으면 fetch 안 함
  });
  console.log(data, "team");

  const handleGoBack = () => {
    router.back();
  };

  // 팔로우 처리 함수 추가
  const handleFollowClick = async (teamId: string) => {
    if (!session.data) {
      alert("로그인이 필요합니다.");
      signIn();
      return;
    }

    try {
      const result = await followTeam({ teamId });
      console.log(result);
      if (result.success) {
        refetch(); // 데이터 재조회하여 UI 업데이트
        // toast.success(result.message); // 토스트 메시지가 있다면 활용
      } else {
        console.warn(result.error);
        alert(result.error);
        // toast.error(result.error);
      }
    } catch (error) {
      console.error(error);
      alert("팔로우 처리 중 오류가 발생했습니다.");
    }
  };

  if (!data) {
    return (
      <div className="text-center text-gray-500 pt-10">
        팀 정보를 불러오는 중입니다.
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="text-center text-gray-500 pt-10">
        존재하지 않는 회원입니다.
      </div>
    );
  }

  // 현재 사용자가 이 팀을 팔로우하고 있는지 확인
  const isFollowing = data.data.followers?.some(
    (follow) => follow.userId === session.data?.user?.id
  );

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

      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between h-16 shrink-0 px-4">
        <button
          className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          onClick={handleGoBack}
        >
          <ArrowLeft style={{ width: "24px", height: "24px" }} />
        </button>
        <div className="flex items-center justify-end gap-1.5">
          {/* 팔로우 버튼 수정 */}
          <button
            type="button"
            className={`shrink-0 h-9 px-4 gap-1.5 flex items-center justify-center rounded-full transition-colors cursor-pointer font-semibold ${
              isFollowing
                ? "bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
                : "bg-neutral-100 hover:bg-neutral-200 text-gray-600 hover:text-gray-700"
            }`}
            onClick={() => handleFollowClick(id)}
          >
            {/* {isFollowing && <UserRoundCheck className="size-5" />} */}
            {isFollowing ? "팔로잉" : "팔로우"}
          </button>
          <button
            className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            type="button"
            onClick={async () => {
              console.log(process.env.NODE_ENV, "env");
              try {
                if (process.env.NODE_ENV === "development") {
                  console.log("development");
                  await navigator.clipboard.writeText(
                    `localhost:3000/teams/${id}`
                  );
                } else {
                  console.log("production");
                  await navigator.clipboard.writeText(
                    `www.futsalgo.com/teams/${id}`
                  );
                }
              } catch (error) {
                console.error(error, "error");
              } finally {
                alert("URL이 복사되었습니다.");
              }
            }}
          >
            <Share className="size-5" />
          </button>
        </div>
      </div>
      {data ? (
        <div className="space-y-3">
          {/* 팀 정보 */}
          <div className="space-y-2">
            <div className="space-y-4 px-4">
              <div className="flex items-center gap-4 h-20">
                {/* 프로필 사진 */}
                <div className="size-20 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {data?.data?.logoUrl ? (
                    <Image
                      width={80}
                      height={80}
                      src={data?.data?.logoUrl}
                      alt="profile_image"
                      className="object-cover"
                    />
                  ) : (
                    <div className="size-16 bg-gray-100 text-2xl flex items-center justify-center">
                      {data?.data?.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="grow flex flex-col">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-lg font-semibold">
                      {data?.data?.name}
                    </h1>
                    <div className="flex items-center">
                      <Hash className="size-4" />
                      <span className="text-sm font-medium mr-1">
                        {data.data.code}
                      </span>
                    </div>
                  </div>
                  <span className="font-medium text-muted-foreground tracking-tight leading-tight">
                    {
                      TEAM_LEVEL_DESCRIPTION[
                        data.data.level as keyof typeof TEAM_LEVEL_DESCRIPTION
                      ]
                    }
                  </span>
                  <div className="flex items-center gap-2 mt-2 text-gray-500">
                    <div className="flex items-center gap-1">
                      <CalendarCheck2 className="size-3.5" />
                      <span className="text-sm tracking-tight mr-1">
                        {data?.data?.createdAt
                          ? `${new Date(
                              data?.data?.createdAt
                            ).toLocaleDateString("ko-KR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })} 등록`
                          : "데이터 없음"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <CalendarCheck2 className="size-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-500 mr-1">
                    {data?.data?.createdAt
                      ? `${new Date(
                          data?.data?.createdAt
                        ).toLocaleDateString()} 등록`
                      : "데이터 없음"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Hash className="size-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-500 mr-1">
                    {data.data.code}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPinned className="size-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-500 mr-1">
                    {data.data.city} {data.data.district}
                  </span>
                </div>
              </div> */}
              {/* 가입하기 */}
              {!data.data.currentUserMembership.isMember ? (
                data.data.recruitmentStatus === "RECRUITING" && (
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
                )
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
              ) : data.data.currentUserMembership.status === "REJECTED" ? (
                <div className="flex items-center justify-between bg-red-400/10 rounded-lg p-2">
                  <div className="flex items-center px-2">
                    <CircleX className="size-5 text-red-600 mr-3" />
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
                      거절 사유
                    </Button>
                    <Button
                      className="text-sm font-semibold text-white bg-indigo-700"
                      size="sm"
                    >
                      재가입 신청
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  className="w-full text-base font-semibold"
                  size="lg"
                  // variant="outline"
                  onClick={() => {
                    router.push(`/teams/${id}/ratings`);
                  }}
                >
                  팀원 평가
                </Button>
              )}
            </div>

            {/* 탭 */}
            <div className="flex items-center justify-between gap-2 px-4 border-b">
              <div className="flex h-12 space-x-2">
                {tabs.map((tab) => (
                  <div
                    key={tab.value}
                    className={`flex justify-center items-center min-w-14 font-semibold text-base px-2 cursor-pointer border-b-4 ${
                      selectedTab === tab.value
                        ? "border-gray-700"
                        : "border-transparent"
                    } ${
                      tab.isDisabled ? "pointer-events-none opacity-50" : ""
                    }`}
                    onClick={() => setSelectedTab(tab.value)}
                  >
                    {tab.label}
                  </div>
                ))}
              </div>
            </div>

            {/* 탭 */}
            {/* <div className="bg-slate-100 flex items-center px-4 sm:px-2 sm:mx-4 h-12  sm:rounded-full">
              {tabs.map((tab) => (
                <div
                  key={tab.value}
                  className={`flex justify-center items-center font-semibold text-base px-4 cursor-pointer h-9 rounded-full ${
                    selectedTab === tab.value ? "bg-black text-white" : ""
                  } ${tab.isDisabled ? "pointer-events-none opacity-50" : ""}`}
                  onClick={() => setSelectedTab(tab.value)}
                >
                  {tab.label}
                </div>
              ))}
            </div> */}
          </div>

          {/* 팀원 */}
          {selectedTab === "members" && (
            <TeamMemberList
              members={data.data.members}
              isMember={data.data.currentUserMembership.isMember}
              role={data.data.currentUserMembership.role}
              status={data.data.currentUserMembership.status}
              refetch={refetch}
              teamId={id}
            />
          )}

          {/* 프로필 */}
          {selectedTab === "overview" && (
            <Fragment>
              {/* 기본 정보 */}
              <div className="border bg-neutral-50 rounded-2xl mx-4 grid grid-cols-3 sm:grid-cols-6 gap-3 p-4">
                <div className="flex flex-col gap-1 items-center my-3">
                  <div className="font-medium">
                    {
                      TEAM_GENDER[
                        data?.data?.gender as keyof typeof TEAM_GENDER
                      ]
                    }
                  </div>
                  <Label className="text-muted-foreground">구분</Label>
                </div>
                <div className="flex flex-col gap-1 items-center my-3">
                  <div className="font-medium">
                    {data.data.stats.professionalCount
                      ? `${data.data.stats.professionalCount}명`
                      : "선출 없음"}
                  </div>
                  <Label className="text-muted-foreground">선수 출신</Label>
                </div>
                <div className="flex flex-col gap-1 items-center my-3">
                  <div className="font-medium">
                    {data.data.stats.averageAge}살
                  </div>
                  <Label className="text-muted-foreground">평균 연령</Label>
                </div>
                <div className="flex flex-col gap-1 items-center my-3">
                  <div className="font-medium">
                    {/* 초청 불가 */}
                    초청 가능
                    {/* {data.data.stats.averageHeight}cm */}
                  </div>
                  <Label className="text-muted-foreground">친선전</Label>
                </div>
                <div className="flex flex-col gap-1 items-center my-3">
                  <div className="font-medium">
                    {data.data.members.approved.length}명
                  </div>
                  <Label className="text-muted-foreground">팀원 수</Label>
                </div>
                <div className="flex flex-col gap-1 items-center my-3">
                  <div className="font-medium">
                    {data.data.recruitmentStatus === "RECRUITING"
                      ? "모집중"
                      : "모집마감"}
                  </div>
                  <Label className="text-muted-foreground">팀원 모집</Label>
                </div>
              </div>

              {/* 라인 프로필 */}
              <div className="px-4">
                {/* 활동 지역 */}
                <div className="w-full flex items-center justify-between px-1 h-12 sm:h-11 border-t border-gray-100 gap-3">
                  <div className="flex items-center space-x-3">
                    <MapPinned className="size-5 text-gray-600" />
                    <span className="font-medium">활동 지역</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-base font-medium text-gray-500">
                      {data.data.city}
                      {data.data.district && ` ${data.data.district}`}
                    </span>
                  </div>
                </div>

                {/* 소개 */}
                <div>
                  <div className="w-full flex items-center justify-between px-1 h-12 sm:h-11 gap-3 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                      <ScrollText className="size-5 text-gray-600" />
                      <span className="font-medium">소개</span>
                    </div>
                    {!Boolean(data?.data?.description) && (
                      <span className="text-base font-medium text-gray-500">
                        없음
                      </span>
                    )}
                  </div>
                  {Boolean(data?.data?.description) && (
                    <p className="border p-4 bg-white rounded-2xl min-h-24 whitespace-pre-line mb-3 break-words">
                      {data?.data?.description}
                    </p>
                  )}
                </div>
              </div>

              {/* 실력 분포 */}
              <div className="border rounded-2xl overflow-hidden mx-4">
                <div className="w-full flex items-center justify-between px-4 h-12 sm:h-11 border-b gap-3 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <ChartPie className={`size-5 text-gray-600`} />
                    <span className="font-medium">팀원 실력 분포</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 p-4">
                  <div className="flex flex-col gap-1 items-center my-3">
                    <div className="font-medium">
                      {data.data.stats.beginnerCount
                        ? `${data.data.stats.beginnerCount}명`
                        : "-"}
                    </div>
                    <Label className="text-muted-foreground">왕초보</Label>
                  </div>
                  <div className="flex flex-col gap-1 items-center my-3">
                    <div className="font-medium">
                      {data.data.stats.amateurCount
                        ? `${data.data.stats.amateurCount}명`
                        : "-"}
                    </div>
                    <Label className="text-muted-foreground">아마추어</Label>
                  </div>
                  <div className="flex flex-col gap-1 items-center my-3">
                    <div className="font-medium">
                      {data.data.stats.aceCount
                        ? `${data.data.stats.aceCount}명`
                        : "-"}
                    </div>
                    <Label className="text-muted-foreground">에이스</Label>
                  </div>
                  <div className="flex flex-col gap-1 items-center my-3">
                    <div className="font-medium">
                      {data.data.stats.semiproCount
                        ? `${data.data.stats.semiproCount}명`
                        : "-"}
                    </div>
                    <Label className="text-muted-foreground">세미프로</Label>
                  </div>
                </div>
              </div>

              {/* 경기일정 요약 */}
              <div className="border rounded-2xl overflow-hidden mx-4">
                <div className="w-full flex items-center justify-between px-4 h-12 sm:h-11 border-b gap-3 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <Calendar className={`size-5 text-gray-600`} />
                    <span className="font-medium">경기일정 요약</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 p-4">
                  <div className="flex flex-col gap-1 items-center my-3">
                    <div className="font-medium">
                      {data.data.stats.scheduleStats.totalSchedules || "0"}
                    </div>
                    <Label className="text-muted-foreground">일정</Label>
                  </div>
                  <div className="flex flex-col gap-1 items-center my-3">
                    <div className="font-medium">
                      {data.data.stats.scheduleStats.totalMatches || "0"}
                    </div>
                    <Label className="text-muted-foreground">경기</Label>
                  </div>
                  <div className="flex flex-col gap-1 items-center my-3">
                    <div className="font-medium">
                      {data.data.stats.scheduleStats.selfMatches || "0"}
                    </div>
                    <Label className="text-muted-foreground">자체전</Label>
                  </div>
                  <div className="flex flex-col gap-1 items-center my-3">
                    <div className="font-medium">
                      {data.data.stats.scheduleStats.friendlyMatches || "0"}
                    </div>
                    <Label className="text-muted-foreground">친선전</Label>
                  </div>
                </div>
              </div>

              {/* 수정 & 삭제 */}
              <div className="px-4 mt-12 space-y-3 sm:grid gap-3 grid-cols-3">
                {data.data.currentUserMembership.role === "OWNER" && (
                  <div className="sm:col-span-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className="rounded-md px-3 flex items-center justify-center h-12 sm:h-11 gap-3 cursor-pointer bg-gray-100 hover:bg-gray-200 w-full transition-colors text-gray-700 font-medium"
                      onClick={() => {
                        setIsLoading(true);
                        router.push(`/edit-team/${id}`);
                      }}
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      className="rounded-md px-3 flex items-center justify-center h-12 sm:h-11 gap-3 cursor-pointer bg-destructive/5 hover:bg-destructive/10 w-full transition-colors text-destructive font-medium"
                    >
                      팀 삭제
                    </button>
                  </div>
                )}

                {data.data.currentUserMembership.status === "APPROVED" &&
                  data.data.currentUserMembership.role !== "OWNER" && (
                    <button
                      type="button"
                      className="rounded-md px-3 flex items-center justify-center h-12 sm:h-11 gap-3 cursor-pointer bg-destructive/5 hover:bg-destructive/10 w-full transition-colors text-destructive font-medium"
                    >
                      팀 탈퇴
                    </button>
                  )}
              </div>
            </Fragment>
          )}

          {/* 사진 */}
          {selectedTab === "photos" && <TeamPhotosGallery teamId={id} />}

          {/* 경기일정 */}
          {selectedTab === "matches" && <TeamSchedules teamId={id} />}
        </div>
      ) : null}
    </div>
  );
};

export default TeamContent;
