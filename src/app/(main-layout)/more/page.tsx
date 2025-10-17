"use client";

import { useSession } from "next-auth/react";
import {
  LogOut,
  FileText,
  Shield,
  ChevronRight,
  Loader2,
  CircleUserRound,
  Bug,
  Lightbulb,
  Instagram,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

const MorePage = () => {
  const session = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const menuItems = [
    {
      items: [
        {
          icon: CircleUserRound,
          label: "프로필 수정",
          // action: () => {
          //   setIsLoading(true);
          //   router.push("/profile");
          // },
          href: "/more/profile",
        },
        // {
        //   icon: NotebookPen,
        //   label: "작성한 후기",
        //   action: () => {
        //     alert("작성한 후기");
        //   },
        // },
      ],
    },
    // {
    //   category: "분석",
    //   items: [
    //     {
    //       icon: ChartPie,
    //       label: "통계",
    //       action: () => alert("통계"),
    //     },
    //   ],
    // },
    {
      category: "지원",
      items: [
        {
          icon: Instagram,
          label: "풋살고 인스타그램",
          href: "https://www.instagram.com/futsalgo_official/",
        },
        {
          icon: Lightbulb,
          label: "제안하기",
          href: "/more/suggestion",
        },
        {
          icon: Bug,
          label: "버그 신고하기",
          href: "/more/bug-report",
        },
        {
          icon: FileText, //
          label: "이용약관",
          href: "/terms",
          // action: () => alert("이용약관"),
        },
        {
          icon: Shield,
          label: "개인정보처리방침",
          href: "/privacy",
          // action: () => alert("개인정보처리방침"),
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
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4 items-center justify-center h-40 w-60 bg-gradient-to-br from-slate-200 to-pink-50 backdrop-blur-lg rounded-lg">
          <Loader2
            className="w-4 h-4 animate-spin"
            style={{ width: "40px", height: "40px", color: "gray" }}
          />
          <div className="text-base text-muted-foreground">로딩 중입니다.</div>
        </div>
      )}
      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0">
        <h1 className="text-[1.625rem] font-bold">더보기</h1>
        {/* <button className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-white rounded-full transition-colors cursor-pointer">
          <Search className="size-5" />
        </button> */}
      </div>
      <div className="space-y-3">
        {!session.data && (
          <div className="text-center py-8 bg-gray-200 rounded-2xl p-4 mx-4 mb-6">
            <h3 className="font-semibold text-gray-900">
              원활한 서비스 이용을 위해 로그인이 필요합니다
            </h3>
            <div className="flex gap-2 justify-center mt-3">
              <Link
                className="text-base bg-black text-white px-6 min-w-28 py-1.5 rounded-full font-bold cursor-pointer active:scale-98"
                href="/login"
              >
                시작하기
              </Link>
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
                <h3 className="text-sm font-medium mb-3 px-4 text-gray-600">
                  {section.category}
                </h3>
              )}
              <div className="">
                {section.items.map((item, itemIndex) => (
                  <Link
                    key={itemIndex}
                    href={
                      !session.data &&
                      (item.label === "제안하기" ||
                        item.label === "버그 신고하기")
                        ? "/login"
                        : item.href
                    }
                    target={
                      item.label === "풋살고 인스타그램" ? "_blank" : undefined
                    }
                    // href={item.href}
                    // onClick={item.action}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 sm:hover:rounded-lg transition-colors cursor-pointer active:bg-gray-100"
                    // className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 hover:rounded-lg transition-colors cursor-pointer ${
                    //   itemIndex !== section.items.length - 1 ? `border-b` : ""
                    // }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="size-5 text-gray-600" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronRight className="size-5 text-gray-400" />
                  </Link>
                ))}
              </div>
            </div>
          ))}

        {/* 로그아웃 버튼 */}
        {session.data && (
          <button
            onClick={() => {
              setIsLoading(true);
              signOut();
            }}
            className="w-full flex items-center justify-between px-4 py-3 cursor-pointer sm:hover:bg-red-500/5 transition-colors text-red-500 active:bg-red-500/10"
          >
            <div className="flex items-center space-x-3">
              <LogOut className="size-5" />
              <span className="font-medium">로그아웃</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default MorePage;
