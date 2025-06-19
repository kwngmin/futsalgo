"use client";

import { Button } from "@/shared/components/ui/button";
import { getTeam } from "../model/actions";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookText,
  ChartPie,
  ChevronRight,
  Share,
  Text,
  Users,
  Volleyball,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Label } from "@/shared/components/ui/label";
import { TEAM_GENDER, TEAM_LEVEL } from "@/entities/team/model/constants";

const logoOptions = [
  "/assets/images/team-logo-sample-1.png",
  "/assets/images/team-logo-sample-2.png",
  "/assets/images/team-logo-sample-3.png",
  "/assets/images/team-logo-sample-4.png",
];

const TeamContent = ({ id }: { id: string }) => {
  const router = useRouter();
  const session = useSession();

  const { data } = useQuery({
    queryKey: ["player", id],
    queryFn: () => getTeam(id),
    enabled: !!id, // id 없으면 fetch 안 함
  });
  console.log(data, "team");

  const handleGoBack = () => {
    router.back();
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
        존재하지 않는 선수입니다.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between h-16 shrink-0 px-3">
        <div className="w-20">
          <Button
            variant="ghost"
            size="lg"
            onClick={handleGoBack}
            className="flex items-center gap-1.5 !px-2"
          >
            <ArrowLeft style={{ width: "24px", height: "24px" }} />
          </Button>
        </div>
        <h1 className="grow flex justify-center text-lg font-semibold">
          팀 정보
        </h1>
        <div className="w-20 flex justify-end gap-3 px-3">
          <button className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-white rounded-full transition-colors cursor-pointer">
            <Share className="w-5 h-5" />
          </button>
        </div>
      </div>
      {data ? (
        <div className="px-3 space-y-4">
          <div className="bg-white rounded-2xl">
            <div className="flex justify-end p-3">
              {id === session.data?.user.id ? (
                <div className="h-7" />
              ) : (
                <Button
                  size="sm"
                  className="rounded-full font-semibold text-sm py-0 px-4 h-7"
                  variant="outline"
                >
                  팔로우
                </Button>
              )}
            </div>
            <div className="flex items-center gap-4 px-6 h-20">
              {/* 프로필 사진 */}
              <div className="size-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                <Image
                  width={80}
                  height={80}
                  src={
                    logoOptions[Math.floor(Math.random() * logoOptions.length)]
                  }
                  //   src={data?.data?.logoUrl ?? ""}
                  alt="profile_image"
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold">
                  {data?.data?.name}
                  <span className="text-base font-normal text-gray-500 ml-2">
                    #{data.data.code}
                  </span>
                </h1>
                {/* <p className="text-base font-medium">
                  {`${
                    data?.data?.city && data?.data?.district
                      ? `${data?.data?.city} ${data?.data?.district}`
                      : "지역 미설정"
                  }`}
                </p> */}
                {/* <p className="text-base font-medium">
                  {`#${data.data.code} • ${
                    data?.data?.city && data?.data?.district
                      ? `${data?.data?.city} ${data?.data?.district}`
                      : "지역 미설정"
                  }`}
                </p> */}
                <p className="text-sm text-gray-500 mt-0.5">
                  생성일:{" "}
                  {data?.data?.createdAt
                    ? new Date(data?.data?.createdAt).toLocaleDateString(
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
            </div>
            <div className="flex justify-end px-3 h-12 mt-4 space-x-2">
              <div className="flex flex-col justify-center items-center space-y-3 min-w-14">
                <span className="font-semibold text-sm px-2">개요</span>
                {/* <div className="bg-blue-500 rounded-t-full h-0.5 w-full flex overflow-hidden" /> */}
              </div>
            </div>
          </div>
          <div className="flex px-3 h-12 mt-4 space-x-2 bg-gray-50 rounded-lg">
            <div className="flex flex-col justify-end items-center space-y-3 min-w-14">
              <span className="font-semibold text-base px-2 leading-tight">
                개요
              </span>
              <div className="bg-blue-500 rounded-t-full h-0.5 w-full flex overflow-hidden" />
            </div>
            <div className="flex flex-col justify-end items-center space-y-3 min-w-14">
              <span className="font-semibold text-base px-2 leading-tight">
                소개
              </span>
              <div className="bg-transparent rounded-t-full h-0.5 w-full flex overflow-hidden" />
            </div>
            <div className="flex flex-col justify-end items-center space-y-3 min-w-14">
              <span className="font-semibold text-base px-2 leading-tight">
                명단
              </span>
              <div className="bg-transparent rounded-t-full h-0.5 w-full flex overflow-hidden" />
            </div>
          </div>
          {/* <div className="bg-white rounded-lg overflow-hidden opacity-50 pointer-events-none">
            <button
              onClick={() => alert("플레이 정보 통계")}
              className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors`}
            >
              <div className="flex items-center space-x-3">
                <div className="size-6 bg-gray-200 rounded-full" />
                <span className="font-medium">소속 팀 없음</span>
              </div>
              <ChevronRight className={`w-5 h-5 text-gray-400}`} />
            </button>
          </div> */}

          {/* 소개 */}
          {data?.data?.description && (
            <div className="bg-white rounded-2xl">
              <div className="w-full flex items-center justify-start px-4 py-3 border-b border-gray-100 space-x-3">
                <Text className={`w-5 h-5 text-gray-600`} />
                <span className="font-medium">팀 소개</span>
              </div>
              <p className="px-4 py-4">{data?.data?.description}</p>
            </div>
          )}

          {/* 기본 정보 */}
          <div className="bg-white rounded-2xl pb-3">
            <div className="w-full flex items-center justify-start px-4 py-3 border-b border-gray-100 space-x-3">
              <BookText className={`w-5 h-5 text-gray-600`} />
              <span className="font-medium">기본 정보</span>
            </div>
            <div className="grid grid-cols-3 gap-3 px-4 bg-white rounded-2xl">
              <div className="flex flex-col gap-1 items-center my-4">
                <div className="font-semibold">
                  {TEAM_GENDER[data?.data?.gender as keyof typeof TEAM_GENDER]}
                </div>
                <Label className="text-muted-foreground">구분</Label>
              </div>
              <div className="flex flex-col gap-1 items-center my-4">
                <div className="font-semibold">
                  {/* {SPORT_TYPE[data?.data?.sportType as keyof typeof SPORT_TYPE]} */}
                  {TEAM_LEVEL[data?.data?.level as keyof typeof TEAM_LEVEL]}
                </div>
                <Label className="text-muted-foreground">실력</Label>
              </div>
              <div className="flex flex-col gap-1 items-center my-4">
                <div className="font-semibold">
                  {data.data.stats.professionalCount
                    ? `${data.data.stats.professionalCount}명`
                    : "없음"}
                </div>
                <Label className="text-muted-foreground">선수 출신</Label>
              </div>
              <div className="flex flex-col gap-1 items-center my-4">
                <div className="font-semibold">
                  {data.data.stats.averageAge}세
                </div>
                <Label className="text-muted-foreground">평균 연령</Label>
              </div>
              <div className="flex flex-col gap-1 items-center my-4">
                <div className="font-semibold">
                  {data.data.stats.averageHeight}cm
                </div>
                <Label className="text-muted-foreground">평균 키</Label>
              </div>
              <div className="flex flex-col gap-1 items-center my-4">
                <div className="font-semibold">
                  {data.data.members.length}명
                </div>
                <Label className="text-muted-foreground">팀원</Label>
              </div>
            </div>
          </div>

          {/* 통계 */}
          {/* <div className="bg-white rounded-lg overflow-hidden">
           */}

          {/* 경기 년도 선택 */}
          {/* <div className="flex items-center justify-between gap-2">
            <h2 className="font-medium text-gray-600 px-2 text-sm">
              경기 년도 선택 :
            </h2>
            <Select>
              <SelectTrigger className="grow bg-white">
                <SelectValue placeholder="선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">2025년</SelectItem>
              </SelectContent>
            </Select>
          </div> */}

          {/* 실력 분포 */}
          <div className="bg-white rounded-2xl pb-3">
            <div className="w-full flex items-center justify-start px-4 py-3 border-b border-gray-100 space-x-3">
              <ChartPie className={`w-5 h-5 text-gray-600`} />
              <span className="font-medium">팀원 실력</span>
            </div>
            <div className="grid grid-cols-4 gap-3 bg-white rounded-2xl p-4">
              <div className="flex flex-col gap-1 items-center my-3">
                <div className="font-semibold">
                  {data.data.stats.beginnerCount
                    ? `${data.data.stats.beginnerCount}명`
                    : "없음"}
                </div>
                <Label className="text-muted-foreground">비기너</Label>
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

          <div className="flex flex-col bg-white rounded-2xl overflow-hidden space-y-3">
            <button
              onClick={() => alert("연습 경기")}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100
              cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <Users className={`w-5 h-5 text-gray-600`} />
                <span className="font-medium">
                  팀원 • {data.data.members.length ?? 0}명
                </span>
              </div>
              <ChevronRight className={`w-5 h-5 text-gray-400}`} />
            </button>
            <div className="grid grid-cols-4 gap-3 bg-white rounded-2xl mb-6 px-3">
              <div className="flex flex-col gap-1 items-center my-3">
                <div className="font-semibold">
                  {data.data.stats.beginnerCount}
                </div>
                <Label className="text-muted-foreground">비기너</Label>
              </div>
              <div className="flex flex-col gap-1 items-center my-3">
                <div className="font-semibold">
                  {data.data.stats.amateurCount}
                </div>
                <Label className="text-muted-foreground">아마추어</Label>
              </div>
              <div className="flex flex-col gap-1 items-center my-3">
                <div className="font-semibold">{data.data.stats.aceCount}</div>
                <Label className="text-muted-foreground">에이스</Label>
              </div>
              <div className="flex flex-col gap-1 items-center my-3">
                <div className="font-semibold">
                  {data.data.stats.semiproCount}
                </div>
                <Label className="text-muted-foreground">세미프로</Label>
              </div>
            </div>
          </div>
          <div className="flex flex-col bg-white rounded-2xl overflow-hidden space-y-3">
            <button
              onClick={() => alert("친선 경기")}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <Volleyball className={`w-5 h-5 text-gray-600`} />
                <span className="font-medium">
                  친선 경기
                  <span className="text-gray-400 px-2 text-sm">
                    우리 팀 vs 외부 팀
                  </span>
                </span>
              </div>
              <ChevronRight className={`w-5 h-5 text-gray-400}`} />
            </button>
            <div className="grid grid-cols-4 gap-3 bg-white rounded-2xl mb-6 px-3">
              <div className="flex flex-col gap-1 items-center my-3">
                <div className="font-semibold">11</div>
                <Label className="text-muted-foreground">경기</Label>
              </div>
              <div className="flex flex-col gap-1 items-center my-3">
                <div className="font-semibold">2</div>
                <Label className="text-muted-foreground">득점</Label>
              </div>
              <div className="flex flex-col gap-1 items-center my-3">
                <div className="font-semibold">5</div>
                <Label className="text-muted-foreground">어시스트</Label>
              </div>
              <div className="flex flex-col gap-1 items-center my-3">
                <div className="font-semibold">8</div>
                <Label className="text-muted-foreground">출전 시간</Label>
              </div>
            </div>
          </div>

          {/* <div className="bg-slate-300">
            <div className="w-fit p-3">
              <FutsalPitch className="w-24" fill="gray" />
            </div>
          </div> */}
        </div>
      ) : null}
    </div>
  );
};

export default TeamContent;
