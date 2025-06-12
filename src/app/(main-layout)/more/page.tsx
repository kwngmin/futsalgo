"use client";

import { useSession } from "next-auth/react";
import {
  LogOut,
  LogIn,
  FileText,
  Shield,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { signOut, signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const MorePage = () => {
  const router = useRouter();
  const session = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const menuItems = [
    // {
    //   category: "계정",
    //   items: [
    //     {
    //       icon: User,
    //       label: "프로필 설정",
    //       action: () => alert("프로필 설정"),
    //     },
    //     {
    //       icon: Edit,
    //       label: "계정 정보 수정",
    //       action: () => alert("계정 정보 수정"),
    //     },
    //   ],
    // },
    {
      category: "지원",
      items: [
        { icon: FileText, label: "이용약관", action: () => alert("이용약관") },
        {
          icon: Shield,
          label: "개인정보처리방침",
          action: () => alert("개인정보처리방침"),
        },
      ],
    },
  ];

  const provider = {
    google: "Google",
    kakao: "Kakao",
    naver: "Naver",
  };

  return (
    <div className="max-w-2xl mx-auto lg:max-w-4xl xl:max-w-2xl pb-16 flex flex-col">
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
        <button className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-white rounded-full transition-colors cursor-pointer">
          {/* <Search className="w-5 h-5" /> */}
        </button>
      </div>
      {session.data ? (
        <div className="px-3 space-y-4">
          <div
            className={`bg-white rounded-2xl p-3 hover:shadow-md/5 transition-shadow cursor-pointer ring-2 ring-accent`}
            onClick={() => {
              setIsLoading(true);
              router.push("/more/profile");
            }}
          >
            {session.data.user.image ? (
              <div className="flex items-start gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <Image
                      width={48}
                      height={48}
                      src={session.data?.user?.image}
                      alt="profile_image"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* MorePage */}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base truncate mb-0.5">
                      {session.data.user.name}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-1">
                    가입일:
                    {new Date(session.data.user.createdAt).toLocaleDateString(
                      "ko-KR",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}{" "}
                    •{" "}
                    {
                      provider[
                        session.data.user.provider as keyof typeof provider
                      ]
                    }
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* 메뉴 섹션들 */}
          {menuItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              <h3 className="text-sm font-medium mb-3 px-2 text-gray-600">
                {section.category}
              </h3>
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
      ) : (
        <div
          className={`${
            false ? "bg-gray-800" : "bg-white"
          } rounded-lg overflow-hidden`}
        >
          <button
            onClick={() => signIn()}
            className={`w-full flex items-center justify-between px-4 py-3 hover:${
              false ? "bg-slate-900" : "bg-red-50"
            } transition-colors text-slate-500`}
          >
            <div className="flex items-center space-x-3">
              <LogIn className="w-5 h-5" />
              <span className="font-medium">로그인</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default MorePage;
