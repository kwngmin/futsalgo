"use client";

import CustomSelect from "@/shared/components/ui/custom-select";
import {
  ArrowsLeftRightIcon,
  //   GearIcon,
  UserMinusIcon,
  UserPlusIcon,
} from "@phosphor-icons/react";
import { TeamMember, User } from "@prisma/client";
import { useCallback, useMemo, useState } from "react";

interface TeamMemberWithUser extends TeamMember {
  user: Pick<
    User,
    | "id"
    | "name"
    | "nickname"
    | "image"
    | "skillLevel"
    | "playerBackground"
    | "position"
    | "birthDate"
    | "height"
    | "gender"
    | "condition"
  >;
}

const TeamManage = ({
  members,
}: {
  members: TeamMemberWithUser[];
  teamId: string;
}) => {
  const [isOpen, setIsOpen] = useState<
    "change-owner" | "add-manager" | "remove-manager" | null
  >(null);

  const [selectedOwnerChangeId, setSelectedOwnerChangeId] =
    useState<string>("");
  const [selectedManagerAddId, setSelectedManagerAddId] = useState<string>("");
  const [selectedManagerRemoveId, setSelectedManagerRemoveId] =
    useState<string>("");

  const ownerChangeOptions = useMemo(() => {
    return members
      .filter((member) => member.role !== "OWNER")
      .map((member) => ({
        value: member.id,
        label: `${member.user.nickname} (${member.user.name})`,
      }));
  }, [members]);

  const managerAddOptions = useMemo(() => {
    return members
      .filter((member) => member.role === "MEMBER")
      .map((member) => ({
        value: member.id,
        label: `${member.user.nickname} (${member.user.name})`,
      }));
  }, [members]);

  const managerRemoveOptions = useMemo(() => {
    return members
      .filter((member) => member.role === "MANAGER")
      .map((member) => ({
        value: member.id,
        label: `${member.user.nickname} (${member.user.name})`,
      }));
  }, [members]);

  const handleOwnerChangeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedOwnerChangeId(e.target.value);
    },
    []
  );

  const handleManagerAddChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedManagerAddId(e.target.value);
    },
    []
  );

  const handleManagerRemoveChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedManagerRemoveId(e.target.value);
    },
    []
  );

  const handleCancel = useCallback(() => {
    setIsOpen(null);
    setSelectedOwnerChangeId("");
    setSelectedManagerAddId("");
    setSelectedManagerRemoveId("");
  }, []);

  return (
    <div className="select-none mt-6">
      {isOpen === null && (
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            className="cursor-pointer rounded-md flex flex-col sm:flex-row justify-center sm:items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-0 sm:h-11 font-semibold bg-white border border-gray-400 transition-shadow shadow-xs hover:shadow-md w-full text-start disabled:opacity-40 disabled:cursor-default"
            onClick={() => setIsOpen("change-owner")}
          >
            <ArrowsLeftRightIcon className="size-6 text-gray-600" />
            <span>팀장 변경</span>
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-md flex flex-col sm:flex-row justify-center sm:items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-0 sm:h-11 font-semibold bg-white border border-gray-400 transition-shadow shadow-xs hover:shadow-md w-full text-start disabled:opacity-40 disabled:cursor-default"
            disabled={managerRemoveOptions.length >= 2}
            onClick={() => setIsOpen("add-manager")}
          >
            <UserPlusIcon className="size-6 text-gray-600" />
            <span>부팀장 추가</span>
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-md flex flex-col sm:flex-row justify-center sm:items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-0 sm:h-11 font-semibold bg-white border border-gray-400 transition-shadow shadow-xs hover:shadow-md w-full text-start disabled:opacity-40 disabled:cursor-default"
            disabled={managerRemoveOptions.length === 0}
            onClick={() => setIsOpen("remove-manager")}
          >
            <UserMinusIcon className="size-6 text-gray-600" />
            <span>부팀장 해제</span>
          </button>
        </div>
      )}

      {isOpen === "change-owner" && (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-2 bg-slate-100 rounded-2xl sm:rounded-md p-3 sm:p-1 select-none mb-3">
          <div className="grow flex items-center gap-2 sm:gap-1">
            <ArrowsLeftRightIcon className="size-7 sm:size-6 text-gray-600 mx-3" />
            <CustomSelect
              key={`owner-change`}
              placeholder="변경할 팀장을 선택하세요"
              isPlaceholderSelectable={false}
              className="w-40 grow shrink-0"
              options={ownerChangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
              value={selectedOwnerChangeId || ""}
              onChange={handleOwnerChangeChange}
              aria-label="변경할 팀장 선택"
            />
          </div>
          <div className="w-full sm:w-48 shrink-0 flex items-center *:cursor-pointer gap-2 sm:gap-1">
            <button
              type="button"
              //   onClick={handleVoteSave}
              className="grow h-11 font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:bg-blue-800 rounded-sm active:scale-95 transition-all duration-200"
              //   disabled={voteMutation.isPending}
            >
              변경
              {/* {voteMutation.isPending ? "저장 중..." : "저장"} */}
            </button>
            <button
              type="button"
              className="grow h-11 font-medium text-gray-700 bg-blue-900/10 hover:bg-blue-900/15 hover:text-gray-800 rounded-sm active:scale-95 transition-all duration-200"
              onClick={handleCancel}
              //   onClick={handleVoteCancel}
              //   disabled={voteMutation.isPending}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {isOpen === "add-manager" && (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-2 bg-slate-100 rounded-2xl sm:rounded-md p-3 sm:p-1 select-none mb-3">
          <div className="grow flex items-center gap-2 sm:gap-1">
            <UserPlusIcon className="size-7 sm:size-6 text-gray-600 mx-3" />
            <CustomSelect
              key={`manager-add`}
              placeholder={`추가할 부팀장을 선택하세요 (${managerRemoveOptions.length}/2)`}
              isPlaceholderSelectable={false}
              className="w-40 grow shrink-0"
              options={managerAddOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
              value={selectedManagerAddId || ""}
              onChange={handleManagerAddChange}
              aria-label="추가할 부팀장 선택"
            />
          </div>
          <div className="w-full sm:w-48 shrink-0 flex items-center *:cursor-pointer gap-2 sm:gap-1">
            <button
              type="button"
              //   onClick={handleVoteSave}
              className="grow h-11 font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:bg-blue-800 rounded-sm active:scale-95 transition-all duration-200"
              //   disabled={voteMutation.isPending}
            >
              추가
              {/* {voteMutation.isPending ? "저장 중..." : "저장"} */}
            </button>
            <button
              type="button"
              className="grow h-11 font-medium text-gray-700 bg-blue-900/10 hover:bg-blue-900/15 hover:text-gray-800 rounded-sm active:scale-95 transition-all duration-200"
              onClick={handleCancel}
              //   onClick={handleVoteCancel}
              //   disabled={voteMutation.isPending}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {isOpen === "remove-manager" && (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-2 bg-slate-100 rounded-2xl sm:rounded-md p-3 sm:p-1 select-none mb-3">
          <div className="grow flex items-center gap-2 sm:gap-1">
            <UserMinusIcon className="size-7 sm:size-6 text-gray-600 mx-3" />
            <CustomSelect
              key={`manager-remove`}
              placeholder={`해제할 부팀장을 선택하세요 (${managerRemoveOptions.length})`}
              isPlaceholderSelectable={false}
              className="w-40 grow shrink-0"
              options={managerRemoveOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
              value={selectedManagerRemoveId || ""}
              onChange={handleManagerRemoveChange}
              aria-label="해제할 부팀장 선택"
            />
          </div>
          <div className="w-full sm:w-48 shrink-0 flex items-center *:cursor-pointer gap-2 sm:gap-1">
            <button
              type="button"
              //   onClick={handleVoteSave}
              className="grow h-11 font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:bg-blue-800 rounded-sm active:scale-95 transition-all duration-200"
              //   disabled={voteMutation.isPending}
            >
              해제
              {/* {voteMutation.isPending ? "저장 중..." : "저장"} */}
            </button>
            <button
              type="button"
              className="grow h-11 font-medium text-gray-700 bg-blue-900/10 hover:bg-blue-900/15 hover:text-gray-800 rounded-sm active:scale-95 transition-all duration-200"
              onClick={handleCancel}
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
