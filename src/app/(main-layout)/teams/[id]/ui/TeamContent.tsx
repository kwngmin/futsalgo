"use client";

import { Button } from "@/shared/components/ui/button";
import { cancelJoinTeam, getTeam, joinTeam } from "../model/actions";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookText,
  ChartPie,
  CircleX,
  EllipsisVertical,
  Info,
  Loader2,
  Share,
  Text,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { Label } from "@/shared/components/ui/label";
import { TEAM_GENDER, TEAM_LEVEL } from "@/entities/team/model/constants";
import { Fragment, useState } from "react";
import TeamMemberList from "./TeamMemberList";
// import { FieldModal } from "@/app/(no-layout)/profile/ui/FieldModal";
// import EditTeamForm from "./EditTeamForm";

// const logoOptions = [
//   "/assets/images/team-logo-sample-1.png",
//   "/assets/images/team-logo-sample-2.png",
//   "/assets/images/team-logo-sample-3.png",
//   "/assets/images/team-logo-sample-4.png",
// ];

const tabs = [
  {
    label: "개요",
    value: "overview",
  },
  // {
  //   label: "소개",
  //   value: "introduction",
  // },
  {
    label: "팀원",
    value: "members",
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
  //               hhihihi
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
  //       <div>hihi</div>
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
        존재하지 않는 선수입니다.
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
        <Button
          variant="ghost"
          size="lg"
          onClick={handleGoBack}
          className="flex items-center gap-1.5 !px-2"
        >
          <ArrowLeft style={{ width: "24px", height: "24px" }} />
          <h1 className="text-2xl font-bold">팀 정보</h1>
        </Button>

        <div className="flex items-center justify-end gap-3 px-3">
          {/* <Button
            // size="sm"
            className="rounded-full font-semibold py-0 px-4 text-base h-8"
            // variant="outline"
          >
            팔로우
          </Button> */}
          <button className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-white rounded-full transition-colors cursor-pointer">
            <Share className="w-5 h-5" />
          </button>
          <button className="shrink-0 size-9 flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-white rounded-full transition-colors cursor-pointer">
            <EllipsisVertical className="size-5" />
          </button>
        </div>
      </div>
      {data ? (
        <div className="px-3 space-y-3">
          {/* 팀 정보 */}
          <div className="bg-white rounded-2xl pt-4 relative">
            {data.data.recruitmentStatus === "RECRUITING" ? (
              <div className="absolute right-4 top-0 flex rounded-b overflow-hidden">
                <div className="text-indigo-800 flex items-center text-sm gap-2 font-medium px-2 h-8 bg-indigo-500/10 rounded">
                  팀원 모집중
                </div>
              </div>
            ) : (
              <div className="absolute right-4 top-0 flex rounded-b overflow-hidden">
                <div className="text-muted-foreground flex items-center text-sm gap-2 font-medium px-2 h-8 bg-gray-100 rounded">
                  팀원 모집 완료
                </div>
              </div>
            )}
            {/* <p className="text-sm text-gray-500 px-2">
                팀 생성일:{" "}
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
              </p> */}
            {/* {false ? (
                <div className="text-green-800 flex items-center text-sm gap-2 font-medium px-2 h-6">
                  <div className="rounded-full size-2 bg-green-600 " />
                  팀전 신청 가능
                </div>
              ) : (
                <div className="text-muted-foreground flex items-center text-sm gap-2 font-medium px-2 h-6">
                  <div className="rounded-full size-2 bg-gray-400 " />
                  자체전 위주
                </div>
              )} */}
            {/* <span className="px-2 text-sm font-medium text-gray-500">
                #{data.data.code}
              </span> */}
            {/* {id === session.data?.user.id ? (
                <div className="h-7 " />
              ) : (
                <div className="flex items-center gap-2">
                  <Button className="rounded-full font-semibold py-0 px-4 text-base h-8">
                    팔로우
                  </Button>
                </div>
              )} */}
            <div className="flex items-center gap-4 px-6 h-20">
              {/* 프로필 사진 */}
              <div className="size-16 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                {/* <Image
                  width={64}
                  height={64}
                  src={
                    logoOptions[Math.floor(Math.random() * logoOptions.length)]
                  }
                  //   src={data?.data?.logoUrl ?? ""}
                  alt="profile_image"
                  className="w-full h-full object-cover"
                  unoptimized
                /> */}
                {data?.data?.logoUrl ? (
                  <Image
                    width={64}
                    height={64}
                    src={data?.data?.logoUrl}
                    alt="profile_image"
                    className="size-16 object-cover"
                  />
                ) : (
                  <div className="size-16 bg-gray-100 text-2xl flex items-center justify-center">
                    {data?.data?.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-semibold">
                  {data?.data?.name}
                  {/* <span className="text-base font-normal text-gray-500 ml-2">
                    #{data.data.code}
                  </span> */}
                </h1>
                <div className="flex items-center gap-1 h-6">
                  <span className="sm:text-sm font-medium text-muted-foreground tracking-tight">
                    {/* 주요 활동 지역:{" "} */}
                    {`${
                      data?.data?.city && data?.data?.district
                        ? `${data?.data?.city} ${data?.data?.district}`
                        : "지역 미설정"
                    }`}
                  </span>
                </div>
                {/* <p className="text-sm text-gray-500">
                  팀 생성일:{" "}
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
                </p> */}
              </div>
            </div>
            {/* 가입하기 */}
            <div className="p-3">
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
              ) : // renderFieldModal("edit", "팀 정보 수정")
              // <div className="grid grid-cols-2 gap-2">
              //   <Button
              //     variant="outline"
              //     size="lg"
              //     onClick={() => {
              //       alert("팀 관리하기");
              //     }}
              //     className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors border-t border-gray-100 first:border-t-0 cursor-pointer"
              //   >
              //     팀원 관리
              //   </Button>
              //   <button
              //     onClick={() => {
              //       alert("팀 관리하기");
              //     }}
              //     className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors border-t border-gray-100 first:border-t-0 cursor-pointer"
              //   >
              //     <div className="flex items-center space-x-3">
              //       <Settings className="size-5 text-gray-600" />
              //       <span className="font-medium">팀 관리하기</span>
              //     </div>
              //     <ChevronRight className={`w-5 h-5 text-gray-400}`} />
              //   </button>
              // </div>
              !data.data.currentUserMembership.isMember ? (
                data.data.recruitmentStatus === "RECRUITING" ? (
                  <Button
                    // className="w-full text-base font-semibold bg-indigo-700"
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
            <div className="flex items-center justify-between gap-2 px-3 border-t border-input">
              <div className="flex h-12 space-x-2">
                {tabs
                  .filter(
                    (tab) =>
                      tab.value !== "management" ||
                      (tab.value === "management" &&
                        (data.data.currentUserMembership.role === "MANAGER" ||
                          data.data.currentUserMembership.role === "OWNER") &&
                        data.data.currentUserMembership.status === "APPROVED")
                  )
                  .map((tab) => (
                    <div
                      key={tab.value}
                      className={`flex justify-center items-center min-w-14 font-semibold text-base px-2 cursor-pointer border-b-2 ${
                        selectedTab === tab.value
                          ? "border-gray-500"
                          : "border-transparent"
                      }`}
                      onClick={() => setSelectedTab(tab.value)}
                    >
                      {tab.label}
                      {/* <div className={` rounded-t-full h-0.5 w-full flex overflow-hidden ${selectedTab === tab.value ? "":""}`} /> */}
                    </div>
                  ))}
              </div>
              {/* {data.data.recruitmentStatus === "RECRUITING" ? (
                <div className="text-indigo-800 flex items-center text-sm gap-2 font-medium px-2 h-8 bg-indigo-500/10 rounded">
                  팀원 모집중
                </div>
              ) : (
                <div className="text-muted-foreground flex items-center text-sm gap-2 font-medium px-2 h-8 bg-gray-100 rounded">
                  팀원 모집 완료
                </div>
              )} */}
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
                <ChevronRight className={`w-5 h-5 text-gray-400}`} />
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

          {/* 개요 */}
          {selectedTab === "overview" && (
            <Fragment>
              {/* 지역 */}
              {/* <div className="bg-white rounded-lg overflow-hidden">
                <button
                  className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors`}
                >
                  <div className="flex items-center space-x-3">
                    <MapPin className={`w-5 h-5 text-gray-600`} />
                    <span className="font-medium">{`${
                      data?.data?.city && data?.data?.district
                        ? `${data?.data?.city} • ${data?.data?.district}`
                        : "지역 미설정"
                    }`}</span>
                  </div>
                </button>
              </div> */}

              {/* 기본 정보 */}
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
                      {data.data.members.approved.length}명
                    </div>
                    <Label className="text-muted-foreground">팀원</Label>
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
                      {/* {SPORT_TYPE[data?.data?.sportType as keyof typeof SPORT_TYPE]} */}
                      {TEAM_LEVEL[data?.data?.level as keyof typeof TEAM_LEVEL]}
                    </div>
                    <Label className="text-muted-foreground">실력</Label>
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

              {/* 소개 */}
              <div className="bg-white rounded-2xl pb-3">
                <div className="w-full flex items-center justify-start px-4 py-3 border-b border-gray-100 space-x-3">
                  <Text className={`w-5 h-5 text-gray-600`} />
                  <span className="font-medium">소개</span>
                </div>
                <p className="px-4 py-4 bg-white rounded-2xl">
                  {data?.data?.description ?? "소개 없음"}
                </p>
              </div>

              {/* 친선 경기 */}
              {/* <div className="flex flex-col bg-white rounded-2xl overflow-hidden space-y-3">
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
              </div> */}
              {/* <p className="text-center text-sm text-gray-500 mt-3">
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
              </p> */}
            </Fragment>
          )}

          {/* 연습 경기 */}
          {/* <div className="flex flex-col bg-white rounded-2xl overflow-hidden space-y-3">
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
          </div> */}
        </div>
      ) : null}
    </div>
  );
};

export default TeamContent;
