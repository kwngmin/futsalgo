"use client";

import { Button } from "@/shared/components/ui/button";
import { cancelJoinTeam, getTeam, joinTeam } from "../model/actions";
import { followTeam } from "../actions/follow-team";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CircleX,
  Loader2,
  Share,
  ChevronUp,
  ChevronDown,
  SquareArrowOutUpRight,
  Copy,
  Pencil,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { Label } from "@/shared/components/ui/label";
import {
  TEAM_GENDER,
  TEAM_LEVEL_DESCRIPTION,
} from "@/entities/team/model/constants";
import { useState } from "react";
import TeamMemberList from "./TeamMemberList";
import {
  CalendarBlankIcon,
  ChatCenteredDotsIcon,
  CheckCircleIcon,
  HashIcon,
  InstagramLogoIcon,
  MapPinAreaIcon,
  UsersIcon,
  YoutubeLogoIcon,
} from "@phosphor-icons/react";

// const tabs = [
//   {
//     label: "프로필",
//     value: "overview",
//     isDisabled: false,
//   },
//   {
//     label: "팀원",
//     value: "members",
//     isDisabled: false,
//   },
//   {
//     label: "경기일정",
//     value: "matches",
//     isDisabled: false,
//   },
//   {
//     label: "사진",
//     value: "photos",
//     isDisabled: false,
//   },
// ];

const TeamContent = ({ id }: { id: string }) => {
  const router = useRouter();
  const session = useSession();
  const searchParams = useSearchParams();
  // const [selectedTab, setSelectedTab] = useState<string>(tabs[0].value);
  const [isLoading, setIsLoading] = useState(false);
  const [copy, setCopy] = useState(false);

  const [isIntroOpen, setIsIntroOpen] = useState(true);

  const { data, refetch } = useQuery({
    queryKey: ["team", id],
    queryFn: () => getTeam(id),
    placeholderData: keepPreviousData,
    enabled: !!id, // id 없으면 fetch 안 함
  });

  const handleGoBack = () => {
    if (searchParams.get("goback") === "false") {
      router.push(`/teams`);
    } else {
      router.back();
    }
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
        <div className="space-y-6">
          {/* 팀 정보 */}
          <div className="space-y-2">
            <div className="space-y-4 px-4">
              <div className="flex gap-3 px-4 sm:px-8">
                {/* 프로필 사진 */}
                <div className="size-14 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {data?.data?.logoUrl ? (
                    <Image
                      width={80}
                      height={80}
                      src={data?.data?.logoUrl}
                      alt="profile_image"
                      className="object-cover"
                    />
                  ) : (
                    <div className="size-16 bg-gray-100 text-[1.625rem] flex items-center justify-center">
                      {data?.data?.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="grow flex flex-col">
                  <h1 className="text-2xl font-semibold">{data?.data?.name}</h1>
                  <span className="text-muted-foreground tracking-tight leading-normal">
                    {
                      TEAM_LEVEL_DESCRIPTION[
                        data.data.level as keyof typeof TEAM_LEVEL_DESCRIPTION
                      ]
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* 탭 */}
            {/* <div className="flex items-center justify-between gap-2 px-4 border-b">
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
            </div> */}

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

          {/* 가입하기 */}
          <div className="px-4 mb-3">
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
                className="w-full font-semibold"
                size="lg"
                onClick={() => {
                  router.push(`/teams/${id}/ratings`);
                }}
              >
                <div className="size-6 rounded-full bg-white flex items-center justify-center">
                  <Pencil className="size-3.5 text-gray-700" strokeWidth={3} />
                </div>
                팀원 평가
              </Button>
            )}
          </div>

          {/* 기본 정보 */}
          <div className="bg-neutral-100 rounded-2xl mx-4 grid grid-cols-3 sm:grid-cols-6 gap-3 p-3 h-48 sm:h-24 items-center mb-2">
            <div className="flex flex-col gap-1 items-center">
              <div className="font-semibold">
                {TEAM_GENDER[data?.data?.gender as keyof typeof TEAM_GENDER]}
              </div>
              <Label className="text-muted-foreground leading-snug">구분</Label>
            </div>
            <div className="flex flex-col gap-1 items-center">
              <div className="font-semibold">
                {data.data.stats.professionalCount
                  ? `${data.data.stats.professionalCount}명`
                  : "선출 없음"}
              </div>
              <Label className="text-muted-foreground leading-snug">
                선수 출신
              </Label>
            </div>
            <div className="flex flex-col gap-1 items-center">
              <div className="font-semibold">
                {data.data.stats.averageAge}살
              </div>
              <Label className="text-muted-foreground leading-snug">
                평균 연령
              </Label>
            </div>
            <div className="flex flex-col gap-1 items-center">
              <div className="font-semibold">
                {data.data.teamMatchAvailable === "AVAILABLE"
                  ? "초청 가능"
                  : "초청 불가"}
              </div>
              <Label className="text-muted-foreground leading-snug">
                친선전
              </Label>
            </div>
            <div className="flex flex-col gap-1 items-center">
              <div className="font-semibold">
                {data.data.members.approved.length}명
              </div>
              <Label className="text-muted-foreground leading-snug">
                팀원 수
              </Label>
            </div>
            <div className="flex flex-col gap-1 items-center">
              <div className="font-semibold">
                {data.data.recruitmentStatus === "RECRUITING"
                  ? "모집중"
                  : "모집마감"}
              </div>
              <Label className="text-muted-foreground leading-snug">
                팀원 모집
              </Label>
            </div>
          </div>

          {/* 라인 프로필 */}
          <div className="px-4 divide-y divide-gray-100">
            {/* 팀 코드 */}
            <div className="w-full flex items-center justify-between px-2 h-12 sm:h-11 gap-2">
              <div className="flex items-center space-x-3">
                <HashIcon className="size-6 text-gray-500" weight="bold" />
                <span className="font-medium">팀 코드</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={async () => {
                    setCopy(true);
                    await navigator.clipboard.writeText(data.data.code);
                    setTimeout(() => {
                      setCopy(false);
                    }, 2000);
                  }}
                  className="flex items-center gap-1 cursor-pointer select-none"
                >
                  <span className="text-base font-semibold text-gray-800 hover:underline underline-offset-4">
                    {data.data.code}
                  </span>
                  <div className="size-6 flex items-center justify-center">
                    {copy ? (
                      <CheckCircleIcon
                        weight="fill"
                        className="size-6 text-blue-500"
                      />
                    ) : (
                      <Copy className="size-4.5 text-gray-500" />
                    )}
                  </div>
                </button>
              </div>
            </div>
            {/* 활동 지역 */}
            <div className="w-full flex items-center justify-between px-2 h-12 sm:h-11 gap-2">
              <div className="flex items-center space-x-3">
                <MapPinAreaIcon
                  className="size-6 text-gray-500"
                  weight="fill"
                />
                <span className="font-medium">활동 지역</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-base font-medium text-gray-500">
                  {data.data.city}
                  {data.data.district && ` ${data.data.district}`}
                </span>
              </div>
            </div>
            {/* instagram */}
            {data.data.instagram && (
              <div className="w-full flex items-center justify-between px-2 h-12 sm:h-11 gap-2">
                <div className="flex items-center space-x-3">
                  <InstagramLogoIcon
                    // weight="bold"
                    // weight="fill"
                    className="size-6 text-gray-500"
                  />
                  <span className="font-medium">인스타그램</span>
                  {/* <span className="font-medium">Instagram</span> */}
                </div>
                <div className="flex items-center gap-1">
                  <a
                    href={`https://instagram.com/${data.data.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 group"
                  >
                    <span className="text-base font-semibold text-gray-800 group-hover:underline underline-offset-4">
                      {data.data.instagram}
                    </span>
                    <SquareArrowOutUpRight className="size-4.5 text-gray-500" />
                  </a>
                </div>
              </div>
            )}
            {/* youtube */}
            {data.data.youtube && (
              <div className="w-full flex items-center justify-between px-2 h-12 sm:h-11 gap-2">
                <div className="flex items-center space-x-3">
                  <YoutubeLogoIcon
                    weight="fill"
                    className="size-6 text-gray-500"
                  />
                  <span className="font-medium">유튜브</span>
                </div>
                <div className="flex items-center gap-1">
                  <a
                    href={`https://www.youtube.com/@${data.data.youtube}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 group"
                  >
                    <span className="text-base font-semibold text-gray-800 group-hover:underline underline-offset-4">
                      {data.data.youtube}
                    </span>
                    <SquareArrowOutUpRight className="size-4.5 text-gray-500" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* 소개 */}
          <div className="px-4">
            <div className="flex justify-between items-center p-2 min-h-13">
              <div className="flex items-center gap-3">
                <ChatCenteredDotsIcon
                  className="size-7 text-zinc-500"
                  // weight="fill"
                />
                <h2 className="text-xl font-semibold">소개</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="text-base sm:text-sm !font-semibold rounded-full bg-neutral-100 text-gray-700 hover:bg-neutral-200 gap-1.5"
                  onClick={() => setIsIntroOpen(!isIntroOpen)}
                >
                  {isIntroOpen ? "접기" : "펼치기"}
                  {isIntroOpen ? (
                    <ChevronUp className="size-4" />
                  ) : (
                    <ChevronDown className="size-4" />
                  )}
                </Button>
              </div>
            </div>
            {isIntroOpen && (
              <div className="border px-4 py-3 bg-white rounded-2xl min-h-24 whitespace-pre-line break-words">
                {data?.data?.description}
              </div>
            )}
          </div>

          {/* 경기일정 요약 */}
          <div className="px-4">
            <div className="flex justify-between items-center p-2 min-h-13">
              <div className="flex items-center gap-3">
                <CalendarBlankIcon //
                  // weight="fill"
                  className="size-7 text-zinc-500"
                />
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">경기일정</h2>
                  {/* <div className="font-medium text-lg text-amber-600">
                        {data.data.members.approved.length}
                      </div> */}
                </div>
              </div>
            </div>
            <div className="bg-neutral-100 overflow-hidden rounded-2xl mb-2">
              <div className="grid grid-cols-4 gap-3 p-3 h-24 items-center">
                <div className="flex flex-col gap-1 items-center">
                  <div className="font-semibold">
                    {data.data.stats.scheduleStats.totalSchedules || "0"}
                  </div>
                  <Label className="text-muted-foreground leading-snug">
                    일정
                  </Label>
                </div>
                <div className="flex flex-col gap-1 items-center">
                  <div className="font-semibold">
                    {data.data.stats.scheduleStats.totalMatches || "0"}
                  </div>
                  <Label className="text-muted-foreground leading-snug">
                    경기
                  </Label>
                </div>
                <div className="flex flex-col gap-1 items-center">
                  <div className="font-semibold">
                    {data.data.stats.scheduleStats.selfMatches || "0"}
                  </div>
                  <Label className="text-muted-foreground leading-snug">
                    자체전
                  </Label>
                </div>
                <div className="flex flex-col gap-1 items-center">
                  <div className="font-semibold">
                    {data.data.stats.scheduleStats.friendlyMatches || "0"}
                  </div>
                  <Label className="text-muted-foreground leading-snug">
                    친선전
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* 팀원 */}
          <div className="px-4">
            <div className="flex justify-between items-center p-2 min-h-13">
              <div className="flex items-center gap-3">
                <UsersIcon //
                  className="size-7 text-zinc-500"
                />
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">팀원</h2>
                  <div className="font-medium text-lg text-amber-600">
                    {data.data.members.approved.length}
                  </div>
                  {/* <div className="font-medium text-sm text-muted-foreground">
                    {data.data.stats.professionalCount
                      ? `선출 ${data.data.stats.professionalCount}명`
                      : "선출 없음"}
                  </div> */}
                </div>
              </div>
            </div>
            <div className="bg-neutral-100 overflow-hidden rounded-2xl mb-2">
              <div className="grid grid-cols-4 gap-3 p-3 h-24 items-center">
                <div className="flex flex-col gap-1 items-center">
                  <div className="font-semibold">
                    {data.data.stats.beginnerCount
                      ? `${data.data.stats.beginnerCount}`
                      : "-"}
                  </div>
                  <Label className="text-muted-foreground leading-snug">
                    왕초보
                  </Label>
                </div>
                <div className="flex flex-col gap-1 items-center">
                  <div className="font-semibold">
                    {data.data.stats.amateurCount
                      ? `${data.data.stats.amateurCount}`
                      : "-"}
                  </div>
                  <Label className="text-muted-foreground leading-snug">
                    아마추어
                  </Label>
                </div>
                <div className="flex flex-col gap-1 items-center">
                  <div className="font-semibold">
                    {data.data.stats.aceCount
                      ? `${data.data.stats.aceCount}`
                      : "-"}
                  </div>
                  <Label className="text-muted-foreground leading-snug">
                    에이스
                  </Label>
                </div>
                <div className="flex flex-col gap-1 items-center">
                  <div className="font-semibold">
                    {data.data.stats.semiproCount
                      ? `${data.data.stats.semiproCount}`
                      : "-"}
                  </div>
                  <Label className="text-muted-foreground leading-snug">
                    세미프로
                  </Label>
                </div>
              </div>
            </div>
            <TeamMemberList
              members={data.data.members}
              isMember={data.data.currentUserMembership.isMember}
              role={data.data.currentUserMembership.role}
              status={data.data.currentUserMembership.status}
              refetch={refetch}
              teamId={id}
            />
          </div>

          {/* <div className="flex items-center gap-2 mt-2 text-gray-500">
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
                  </div> */}

          {/* 등록 날짜와 만든이 */}
          <div className="flex items-center justify-center gap-2 pt-6">
            <span className="text-center text-sm text-gray-500">
              등록일:{" "}
              {data?.data?.createdAt
                ? new Date(data?.data?.createdAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : ""}
            </span>
          </div>

          {/* 수정 & 삭제 */}
          <div className="px-4 mt-12 space-y-3 sm:grid gap-3 grid-cols-3">
            {data.data.currentUserMembership.role === "OWNER" && (
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
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

          {/* 사진 */}
          {/* {selectedTab === "photos" && <TeamPhotosGallery teamId={id} />} */}

          {/* 경기일정 */}
          {/* {selectedTab === "matches" && <TeamSchedules teamId={id} />} */}
        </div>
      ) : null}
    </div>
  );
};

export default TeamContent;
