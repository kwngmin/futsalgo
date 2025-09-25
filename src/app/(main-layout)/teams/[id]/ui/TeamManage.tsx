"use client";

import {
  ArrowsLeftRightIcon,
  //   GearIcon,
  UserMinusIcon,
  UserPlusIcon,
} from "@phosphor-icons/react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const TeamManage = () => {
  const [isOpen, setIsOpen] = useState<
    "change-owner" | "add-manager" | "remove-manager" | null
  >(null);

  return (
    <div className="select-none">
      {/* 헤더 */}
      {/* <div className="flex justify-between items-center p-2 min-h-13 border-b border-slate-200 mb-2">
        <div className="flex items-center gap-2">
          <GearIcon weight="fill" className="size-7 text-zinc-500" />
          <h2 className="text-xl font-semibold">권한 설정</h2>
        </div>
      </div> */}

      {isOpen === null && (
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            className="cursor-pointer rounded-md flex flex-col sm:flex-row justify-center sm:items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-0 sm:h-11 font-semibold bg-white border border-gray-400 transition-shadow shadow-xs hover:shadow-md w-full mb-3 text-start"
            onClick={() => setIsOpen("change-owner")}
          >
            <ArrowsLeftRightIcon className="size-6 text-gray-600" />
            <span>팀장 변경</span>
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-md flex flex-col sm:flex-row justify-center sm:items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-0 sm:h-11 font-semibold bg-white border border-gray-400 transition-shadow shadow-xs hover:shadow-md w-full mb-3 text-start"
            onClick={() => setIsOpen("add-manager")}
          >
            <UserPlusIcon className="size-6 text-gray-600" />
            <span>부팀장 추가</span>
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-md flex flex-col sm:flex-row justify-center sm:items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-0 sm:h-11 font-semibold bg-white border border-gray-400 transition-shadow shadow-xs hover:shadow-md w-full mb-3 text-start"
            onClick={() => setIsOpen("remove-manager")}
          >
            <UserMinusIcon className="size-6 text-gray-600" />
            <span>부팀장 해제</span>
          </button>
        </div>
      )}

      {isOpen === "change-owner" && (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-slate-100 rounded-2xl p-3 sm:px-4 select-none mb-3">
          <div className="flex items-center gap-2 grow">
            <div className="relative w-full">
              <select
                // value={selectedMvpId}
                // onChange={(e) => setSelectedMvpId(e.target.value)}
                className="w-full px-3 py-2 h-12 sm:h-10 border border-input rounded-md bg-white appearance-none"
              >
                <option value="">변경할 팀장을 선택하세요</option>
                {/* {votingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))} */}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
            </div>
          </div>
          <div className="w-full sm:w-48 shrink-0 flex items-center *:cursor-pointer gap-1.5 ">
            <button
              type="button"
              //   onClick={handleVoteSave}
              className="grow h-11 sm:h-9 font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:bg-blue-800 rounded-sm active:scale-95 transition-all duration-200"
              //   disabled={voteMutation.isPending}
            >
              변경
              {/* {voteMutation.isPending ? "저장 중..." : "저장"} */}
            </button>
            <button
              type="button"
              className="grow h-11 sm:h-9 font-medium text-gray-700 bg-blue-900/10 hover:bg-blue-900/15 hover:text-gray-800 rounded-sm active:scale-95 transition-all duration-200"
              onClick={() => setIsOpen(null)}
              //   onClick={handleVoteCancel}
              //   disabled={voteMutation.isPending}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {isOpen === "add-manager" && (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-slate-100 rounded-2xl p-3 sm:px-4 select-none mb-3">
          <div className="flex items-center gap-2 grow">
            <div className="relative w-full">
              <select
                // value={selectedMvpId}
                // onChange={(e) => setSelectedMvpId(e.target.value)}
                className="w-full px-3 py-2 h-12 sm:h-10 border border-input rounded-md bg-white appearance-none"
              >
                <option value="">추가할 부팀장을 선택하세요</option>
                {/* {votingOptions.map((option) => (
               <option key={option.value} value={option.value}>
                 {option.label}
               </option>
             ))} */}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
            </div>
          </div>
          <div className="w-full sm:w-48 shrink-0 flex items-center *:cursor-pointer gap-1.5 ">
            <button
              type="button"
              //   onClick={handleVoteSave}
              className="grow h-11 sm:h-9 font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:bg-blue-800 rounded-sm active:scale-95 transition-all duration-200"
              //   disabled={voteMutation.isPending}
            >
              추가
              {/* {voteMutation.isPending ? "저장 중..." : "저장"} */}
            </button>
            <button
              type="button"
              className="grow h-11 sm:h-9 font-medium text-gray-700 bg-blue-900/10 hover:bg-blue-900/15 hover:text-gray-800 rounded-sm active:scale-95 transition-all duration-200"
              onClick={() => setIsOpen(null)}
              //   onClick={handleVoteCancel}
              //   disabled={voteMutation.isPending}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {isOpen === "remove-manager" && (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-slate-100 rounded-2xl p-3 sm:px-4 select-none mb-3">
          <div className="flex items-center gap-2 grow">
            <div className="relative w-full">
              <select
                // value={selectedMvpId}
                // onChange={(e) => setSelectedMvpId(e.target.value)}
                className="w-full px-3 py-2 h-12 sm:h-10 border border-input rounded-md bg-white appearance-none"
              >
                <option value="">해제할 부팀장을 선택하세요</option>
                {/* {votingOptions.map((option) => (
                 <option key={option.value} value={option.value}>
                   {option.label}
                 </option>
               ))} */}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
            </div>
          </div>
          <div className="w-full sm:w-48 shrink-0 flex items-center *:cursor-pointer gap-1.5 ">
            <button
              type="button"
              //   onClick={handleVoteSave}
              className="grow h-11 sm:h-9 font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:bg-blue-800 rounded-sm active:scale-95 transition-all duration-200"
              //   disabled={voteMutation.isPending}
            >
              해제
              {/* {voteMutation.isPending ? "저장 중..." : "저장"} */}
            </button>
            <button
              type="button"
              className="grow h-11 sm:h-9 font-medium text-gray-700 bg-blue-900/10 hover:bg-blue-900/15 hover:text-gray-800 rounded-sm active:scale-95 transition-all duration-200"
              onClick={() => setIsOpen(null)}
              //   onClick={handleVoteCancel}
              //   disabled={voteMutation.isPending}
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManage;
