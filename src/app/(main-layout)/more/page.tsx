"use client";

import { useSession } from "next-auth/react";
import { User, LogOut, LogIn } from "lucide-react";
import { signOut, signIn } from "next-auth/react";

const MorePage = () => {
  const session = useSession();
  console.log(session.data?.user, "session");
  console.log(session.data?.user?.image, "image");

  return (
    <div className="max-w-2xl mx-auto lg:max-w-4xl xl:max-w-2xl pb-16 flex flex-col">
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
          >
            {session.data ? (
              <div className="flex items-start gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {session.data?.user?.image ? (
                      <img
                        src={session.data?.user?.image}
                        alt={session.data?.user?.name}
                        className="w-full h-full object-cover p-1.5"
                      />
                    ) : (
                      <User className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  {/* MorePage */}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base truncate mb-0.5">
                      {session.data.user.nickname}
                    </h3>
                    {/* 남성, 여성 구분 */}
                    {session.data.user.gender && (
                      <span
                        className={`size-5 flex items-center justify-center text-xs font-semibold rounded flex-shrink-0 ${
                          session.data.user.gender === "MALE"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-pink-50 text-pink-600"
                        }`}
                      >
                        {session.data.user.gender === "MALE" ? "M" : "F"}
                      </span>
                    )}
                    {/* 팔로잉 표시 (현재 사용자가 아닐 때만) */}
                    {/* {!isCurrentUser && player.isFollowing && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-800 rounded-full flex-shrink-0 outline outline-slate-200">
                        팔로잉
                      </span>
                    )} */}
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-1">
                    {/* {session.data.user.teamName || "무소속"} */}팀 없음
                  </p>
                </div>
              </div>
            ) : null}
          </div>
          {/* 로그아웃 버튼 */}
          {session.data && (
            <div
              className={`${
                false ? "bg-gray-800" : "bg-white"
              } rounded-lg overflow-hidden`}
            >
              <button
                onClick={() => signOut()}
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
