"use client";

import { Button } from "@/shared/components/ui/button";
import { cancelJoinTeam, getTeam, joinTeam } from "../model/actions";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChartPie,
  ChevronRight,
  CircleX,
  EllipsisVertical,
  Loader2,
  MapPinned,
  ScrollText,
  Share,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { Label } from "@/shared/components/ui/label";
import {
  TEAM_GENDER,
  TEAM_LEVEL,
  TEAM_LEVEL_DESCRIPTION,
} from "@/entities/team/model/constants";
import { Fragment, useState } from "react";
import TeamMemberList from "./TeamMemberList";

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
    label: "경기",
    value: "matches",
    isDisabled: true,
  },
  {
    label: "사진",
    value: "photos",
    isDisabled: true,
  },
  {
    label: "통계",
    value: "statistics",
    isDisabled: true,
  },
];

const TeamContent = ({ id }: { id: string }) => {
  const router = useRouter();
  const session = useSession();
  const [selectedTab, setSelectedTab] = useState<string>(tabs[0].value);
  const [isLoading, setIsLoading] = useState(false);

  // const [modalStates, setModalStates] = useState({
  //   edit: false,
  //   TeamLevel: false,
  //   playerSkillLevel: false,
  // });

  const { data, refetch } = useQuery({
    queryKey: ["team", id],
    queryFn: () => getTeam(id),
    enabled: !!id, // id 없으면 fetch 안 함
  });
  console.log(data, "team");

  const handleGoBack = () => {
    router.back();
  };

  // const openModal = (field: keyof typeof modalStates) => {
  //   setModalStates((prev) => ({ ...prev, [field]: true }));
  // };

  // const closeModal = (field: keyof typeof modalStates) => {
  //   setModalStates((prev) => ({ ...prev, [field]: false }));
  // };

  // const renderFieldModal = (
  //   field: "edit" | "TeamLevel" | "playerSkillLevel",
  //   title: string
  // ) => (
  //   <FieldModal
  //     title={title}
  //     open={modalStates[field]}
  //     onOpenChange={(open) => {
  //       if (!open) closeModal(field);
  //     }}
  //     trigger={
  //       field === "edit" ? (
  //         <Button
  //           variant="outline"
  //           size="lg"
  //           className="w-full text-base font-semibold cursor-pointer"
  //           onClick={() => openModal(field)}
  //         >
  //           팀 정보 수정
  //         </Button>
  //       ) : (
  //         <div
  //           onClick={() => openModal(field)}
  //           className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0"
  //         >
  //           <div className="flex items-center space-x-3">
  //             {/* {field === "nickname" ? (
  //             <IdCard className={`w-5 h-5 text-gray-600`} />
  //           ) : field === "email" ? (
  //             <Mail className={`w-5 h-5 text-gray-600`} />
  //           ) : field === "phone" ? (
  //             <Phone className={`w-5 h-5 text-gray-600`} />
  //           ) : (
  //             <User2 className="w-5 h-5 text-gray-600" />
  //           )} */}
  //             <span className="font-medium">
  //               {/* {field === "basic"
  //               ? `${data.name || "미설정"} • ${
  //                   GENDER[data.gender as keyof typeof GENDER]
  //                 } • ${
  //                   data.birthDate
  //                     ? age.success
  //                       ? `${age.age}세`
  //                       : "생년월일 미설정"
  //                     : "생년월일 미설정"
  //                 } • ${data.height ? `${data.height}cm` : "키 미설정"}`
  //               : field === "phone"
  //               ? formatPhoneNumber(data[field] || "") || "설정되지 않음"
  //               : data[field] || "설정되지 않음"} */}
  //             </span>
  //           </div>
  //           <ChevronRight className="w-5 h-5 text-gray-400" />
  //         </div>
  //       )
  //     }
  //   >
  //     {field === "edit" ? (
  //       data?.data ? (
  //         <EditTeamForm team={data?.data} />
  //       ) : (
  //         <div>데이터 없음</div>
  //       )
  //     ) : (
  //       <div>hi</div>
  //     )}
  //     {/* {field === "phone" ? (
  //       <ProfilePhone
  //         data={data[field] || ""}
  //         onSuccess={() => closeModal(field)}
  //       />
  //     ) : field === "nickname" ? (
  //       <ProfileNickname
  //         data={data[field] || ""}
  //         onSuccess={() => closeModal(field)}
  //       />
  //     ) : field === "email" ? (
  //       <ProfileEmail
  //         data={data[field] || ""}
  //         onSuccess={() => closeModal(field)}
  //       />
  //     ) : (
  //       <ProfileBasicForm data={data} onSuccess={() => closeModal(field)} />
  //     )} */}
  //   </FieldModal>
  // );

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
      <div className="flex items-center justify-between h-16 shrink-0 px-3">
        <button
          className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          onClick={handleGoBack}
        >
          <ArrowLeft style={{ width: "24px", height: "24px" }} />
        </button>
        <div className="flex items-center justify-end gap-2">
          <Button className="rounded-full font-semibold py-0 px-4 text-base h-8">
            팔로우
          </Button>
          <button className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <Share className="w-5 h-5" />
          </button>
          <button className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <EllipsisVertical className="size-5" />
          </button>
        </div>
      </div>
      {data ? (
        <div className="space-y-3">
          {/* 팀 정보 */}
          <div className="border-b border-gray-300 space-y-2">
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
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-semibold">
                      {data?.data?.name}
                    </h1>
                    <div className="h-5 flex items-center font-normal pb-0.5">
                      #{data.data.code}
                    </div>
                  </div>
                  <span className="text-muted-foreground tracking-tight">
                    {data?.data?.createdAt
                      ? `${new Date(data?.data?.createdAt).toLocaleDateString(
                          "ko-KR",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )} 등록`
                      : "데이터 없음"}
                  </span>
                </div>
              </div>

              {/* 가입하기 */}
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
                ) : (
                  // 빈 여백 추가
                  <div />
                )
              ) : data.data.currentUserMembership.status === "PENDING" ? (
                // <div className="flex items-center justify-between bg-slate-400/10 rounded-lg p-1.5">
                //   <div className="flex items-center px-2">
                //     {/* <Hourglass className="w-5 h-5 mr-3 stroke-indigo-700" /> */}
                //     <span className="font-medium text-slate-700">
                //       승인 대기중
                //     </span>
                //   </div>
                //   <Button
                //     className="text-sm font-semibold text-slate-700"
                //     variant="outline"
                //     size="sm"
                //   >
                //     가입신청 취소
                //   </Button>
                // </div>
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
            </div>

            {/* 탭 */}
            <div className="flex items-center justify-between gap-2 px-4">
              <div className="flex h-12 space-x-2">
                {tabs
                  // .filter(
                  //   (tab) =>
                  //     tab.value !== "management" ||
                  //     (tab.value === "management" &&
                  //       (data.data.currentUserMembership.role === "MANAGER" ||
                  //         data.data.currentUserMembership.role === "OWNER") &&
                  //       data.data.currentUserMembership.status === "APPROVED")
                  // )
                  .map((tab) => (
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
                      {/* <div className={` rounded-t-full h-0.5 w-full flex overflow-hidden ${selectedTab === tab.value ? "":""}`} /> */}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* 가입하기 */}
          {/* {!data.data.currentUserMembership.isMember ? (
            data.data.recruitmentStatus === "RECRUITING" ? (
              <Button
                className="w-full text-base font-semibold bg-indigo-700"
                size="lg"
                onClick={async () => {
                  if (session.data) {
                    try {
                      const result = await joinTeam(id);
                      console.log(result);
                      if (result?.success) {
                        alert("가입 신청이 완료되었습니다.");
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
            <div className="flex items-center justify-between bg-white rounded-lg p-2">
              <div className="flex items-center px-2">
                <Hourglass className="w-5 h-5 mr-3" />
                <span className="font-medium">가입 대기중</span>
              </div>
              <Button
                className="text-sm font-semibold text-indigo-700"
                variant="outline"
                size="sm"
              >
                가입 취소
              </Button>
            </div>
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
          )} */}

          {/* 팀 관리하기 */}
          {/* {(data.data.currentUserMembership.role === "MANAGER" ||
            data.data.currentUserMembership.role === "OWNER") && (
            <div className="bg-white rounded-lg overflow-hidden">
              <button
                onClick={() => {
                  alert("팀 관리하기");
                }}
                // onClick={() => router.push(`/players/${member.userId}`)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors border-t border-gray-100 first:border-t-0 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <Settings className="size-5 text-gray-600" />
                  <span className="font-medium">팀 관리하기</span>
                </div>
                <ChevronRight className="size-5 text-gray-400" />
              </button>
            </div>
          )} */}

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
              <div className="mx-4 grid grid-cols-3 sm:grid-cols-6 gap-3 p-4">
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
                    {data.data.members.approved.length}명
                  </div>
                  <Label className="text-muted-foreground">팀원 수</Label>
                </div>
                <div className="flex flex-col gap-1 items-center my-3">
                  <div className="font-semibold">
                    {data.data.recruitmentStatus === "RECRUITING"
                      ? "모집중"
                      : "마감"}
                  </div>
                  <Label className="text-muted-foreground">팀원 모집</Label>
                </div>
              </div>
              {/* <div className="border rounded-2xl overflow-hidden mx-4">
                <div className="w-full flex items-center px-4 py-3 border-b bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <List className={`w-5 h-5 text-gray-600`} />
                    <span className="font-medium">기본 정보</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 p-4">
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
                      {data.data.members.approved.length}명
                    </div>
                    <Label className="text-muted-foreground">팀원 수</Label>
                  </div>
                  <div className="flex flex-col gap-1 items-center my-3">
                    <div className="font-semibold">
                      {data.data.recruitmentStatus === "RECRUITING"
                        ? "모집중"
                        : "마감"}
                    </div>
                    <Label className="text-muted-foreground">팀원 모집</Label>
                  </div>
                </div>
              </div> */}

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

              {/* 팀 실력 */}
              <div className="border rounded-2xl overflow-hidden mx-4">
                <div
                  className="w-full flex items-center justify-between px-4 py-3 border-b gap-3 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    alert("팀 실력");
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <Sparkles className={`w-5 h-5 text-gray-600`} />
                    <span className="font-medium">팀 실력</span>
                  </div>
                  <ChevronRight className="size-5 text-gray-400" />
                </div>
                <div className="flex flex-col gap-1 items-center px-4 py-6 my-3 font-semibold">
                  {`${TEAM_LEVEL[data.data.level as keyof typeof TEAM_LEVEL]} - 
                        ${
                          TEAM_LEVEL_DESCRIPTION[
                            data.data
                              .level as keyof typeof TEAM_LEVEL_DESCRIPTION
                          ]
                        }`}
                </div>
              </div>

              {/* 실력 분포 */}
              <div className="border rounded-2xl overflow-hidden mx-4">
                <div
                  className="w-full flex items-center justify-between px-4 py-3 border-b gap-3 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    alert("팀원 실력");
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <ChartPie className={`w-5 h-5 text-gray-600`} />
                    <span className="font-medium">팀원 실력</span>
                  </div>
                  <ChevronRight className="size-5 text-gray-400" />
                </div>
                <div className="grid grid-cols-4 gap-3 p-4">
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

              {/* 주요 활동 지역 */}
              <div className="border rounded-2xl overflow-hidden mx-4">
                <div className="w-full flex items-center px-4 py-3 border-b bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <MapPinned className={`w-5 h-5 text-gray-600`} />
                    <span className="font-medium">주요 활동 지역</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-center px-4 py-6 my-3 font-semibold">
                  {data.data.city}
                  {data.data.district && ` ${data.data.district}`}
                </div>
              </div>

              {/* 소개 */}
              <div className="border rounded-2xl mx-4">
                <div className="w-full flex items-center justify-start px-4 py-3 border-b bg-gray-50 space-x-3">
                  <ScrollText className={`w-5 h-5 text-gray-600`} />
                  <span className="font-medium">소개</span>
                </div>
                <p className="px-4 py-6 my-3 sm:my-0">
                  {data?.data?.description ?? "소개 없음"}
                </p>
              </div>
            </Fragment>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default TeamContent;
