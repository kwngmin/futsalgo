"use client";

import { useSession } from "next-auth/react";
import {
  LogOut,
  FileText,
  Shield,
  ChevronRight,
  Loader2,
  CircleUserRound,
  ChartPie,
  Heart,
  Bug,
  MessageCircleMore,
  Bookmark,
} from "lucide-react";
import { signOut, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const MorePage = () => {
  const router = useRouter();
  const session = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const menuItems = [
    {
      items: [
        {
          icon: CircleUserRound,
          label: "프로필",
          action: () => {
            setIsLoading(true);
            router.push("/profile");
          },
        },
        {
          icon: Bookmark,
          label: "팔로잉 한 팀",
          action: () => alert("팔로잉 한 팀"),
        },
        {
          icon: Heart,
          label: "팔로잉 한 선수",
          action: () => alert("팔로잉 한 선수"),
        },
      ],
    },
    {
      category: "분석",
      items: [
        {
          icon: ChartPie,
          label: "통계",
          action: () => alert("통계"),
        },
      ],
    },
    {
      category: "지원",
      items: [
        {
          icon: MessageCircleMore,
          label: "문의하기",
          action: () => alert("문의하기"),
        },
        {
          icon: Bug,
          label: "버그 신고하기",
          action: () => alert("버그 신고"),
        },
        { icon: FileText, label: "이용약관", action: () => alert("이용약관") },
        {
          icon: Shield,
          label: "개인정보처리방침",
          action: () => alert("개인정보처리방침"),
        },
      ],
    },
  ];

  // const provider = {
  //   google: "구글",
  //   kakao: "카카오",
  //   naver: "네이버",
  // };

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
      <div className="flex items-center justify-between px-6 h-16 shrink-0">
        <h1 className="text-2xl font-bold">더보기</h1>
        <button className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-white rounded-full transition-colors cursor-pointer">
          {/* <Search className="w-5 h-5" /> */}
        </button>
      </div>
      <div className="px-3 space-y-3">
        {!session.data && (
          <div className="text-center py-8 bg-gray-200 rounded-2xl p-4">
            <h3 className="font-semibold text-gray-900">
              서비스를 이용하기 위해 로그인이 필요합니다
            </h3>
            <div className="flex gap-2 justify-center mt-3">
              <button
                className="text-base bg-black text-white px-6 min-w-28 py-1.5 rounded-full font-bold cursor-pointer"
                onClick={() => signIn()}
              >
                시작하기
              </button>
            </div>
          </div>
        )}

        {/* 메뉴 섹션들 */}
        {menuItems
          .filter(
            (section) => session.data || (!session.data && section.category)
          )
          .map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              {section.category && (
                <h3 className="text-sm font-medium mb-3 px-2 text-gray-600">
                  {section.category}
                </h3>
              )}
              <div className="bg-white rounded-lg overflow-hidden">
                {section.items.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    onClick={item.action}
                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors ${
                      itemIndex !== section.items.length - 1
                        ? `border-b border-gray-100`
                        : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className={`w-5 h-5 text-gray-600`} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-gray-400}`} />
                  </button>
                ))}
              </div>
            </div>
          ))}

        {/* 로그아웃 버튼 */}
        {session.data && (
          <div
            className={`${
              false ? "bg-gray-800" : "bg-white"
            } rounded-lg overflow-hidden`}
          >
            <button
              onClick={() => {
                setIsLoading(true);
                signOut();
              }}
              className={`w-full flex items-center justify-between px-4 py-3 hover:${
                false ? "bg-red-900" : "bg-red-50"
              } transition-colors text-red-500`}
            >
              <div className="flex items-center space-x-3">
                <LogOut className="w-5 h-5" />
                <span className="font-medium">로그아웃</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MorePage;
