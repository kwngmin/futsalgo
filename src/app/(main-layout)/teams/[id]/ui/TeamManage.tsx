"use client";

import CustomSelect from "@/shared/components/ui/custom-select";
import {
  ArrowsLeftRightIcon,
  GearIcon,
  UserMinusIcon,
  UserPlusIcon,
} from "@phosphor-icons/react";
import { TeamMember, User } from "@prisma/client";
import { useCallback, useMemo, useState, useTransition } from "react";
import {
  changeTeamOwner,
  addTeamManager,
  removeTeamManager,
} from "../actions/team-management-actions";
import { toast } from "sonner"; // 또는 사용하는 toast 라이브러리

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

interface TeamManageProps {
  members: TeamMemberWithUser[];
  teamId: string;
  onRefetch: () => void; // 데이터 리페치 함수
}

type ActionMode = "change-owner" | "add-manager" | "remove-manager" | null;

// 버튼 스타일 상수
const BUTTON_STYLES = {
  action:
    "cursor-pointer rounded-md flex flex-col sm:flex-row justify-center sm:items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-0 sm:h-11 font-semibold bg-white border border-gray-300 hover:border-gray-400 transition-shadow shadow-xs hover:shadow-md w-full text-start disabled:opacity-40 disabled:cursor-default disabled:pointer-events-none",
  primary:
    "grow h-11 font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:bg-blue-800 rounded-sm active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
  secondary:
    "grow h-11 font-medium text-gray-700 bg-blue-900/10 hover:bg-blue-900/15 hover:text-gray-800 rounded-sm active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
} as const;

// 액션 설정 인터페이스
interface ActionConfig {
  icon: React.ReactNode;
  title: string;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onConfirm: () => void;
  confirmText: string;
}

// 액션 UI 컴포넌트
const ActionUI = ({
  config,
  onCancel,
  isPending,
}: {
  config: ActionConfig;
  onCancel: () => void;
  isPending: boolean;
}) => (
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-2 bg-slate-100 rounded-2xl sm:rounded-md p-3 sm:p-1">
    <div className="grow flex items-center gap-2 sm:gap-1">
      <div className="size-7 sm:size-6 text-gray-600 mx-3">{config.icon}</div>
      <CustomSelect
        placeholder={config.placeholder}
        isPlaceholderSelectable={false}
        className="w-40 grow shrink-0"
        options={config.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        value={config.value}
        onChange={config.onChange}
        aria-label={config.placeholder}
        disabled={isPending}
      />
    </div>
    <div className="w-full sm:w-48 shrink-0 flex items-center *:cursor-pointer gap-2 sm:gap-1">
      <button
        type="button"
        onClick={config.onConfirm}
        className={BUTTON_STYLES.primary}
        disabled={isPending || !config.value}
      >
        {isPending ? "처리 중..." : config.confirmText}
      </button>
      <button
        type="button"
        className={BUTTON_STYLES.secondary}
        onClick={onCancel}
        disabled={isPending}
      >
        취소
      </button>
    </div>
  </div>
);

const TeamManage = ({ members, teamId, onRefetch }: TeamManageProps) => {
  const [isPending, startTransition] = useTransition();
  const [actionMode, setActionMode] = useState<ActionMode>(null);
  const [selectedIds, setSelectedIds] = useState({
    owner: "",
    managerAdd: "",
    managerRemove: "",
  });

  // 옵션 목록 메모이제이션
  const options = useMemo(() => {
    const ownerChange = members
      .filter((member) => member.role !== "OWNER")
      .map((member) => ({
        value: member.id,
        label: `${member.user.nickname} (${member.user.name})`,
      }));

    const managerAdd = members
      .filter((member) => member.role === "MEMBER")
      .map((member) => ({
        value: member.id,
        label: `${member.user.nickname} (${member.user.name})`,
      }));

    const managerRemove = members
      .filter((member) => member.role === "MANAGER")
      .map((member) => ({
        value: member.id,
        label: `${member.user.nickname} (${member.user.name})`,
      }));

    return { ownerChange, managerAdd, managerRemove };
  }, [members]);

  // 선택 변경 핸들러
  const handleSelectionChange = useCallback(
    (type: keyof typeof selectedIds) =>
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedIds((prev) => ({ ...prev, [type]: e.target.value }));
      },
    []
  );

  // 취소 핸들러
  const handleCancel = useCallback(() => {
    setActionMode(null);
    setSelectedIds({ owner: "", managerAdd: "", managerRemove: "" });
  }, []);

  // 팀장 변경 확인 핸들러
  const handleOwnerChange = useCallback(async () => {
    if (!selectedIds.owner) return;

    const confirmed = window.confirm(
      "팀장을 변경하시면 현재 팀장은 일반 팀원으로 변경됩니다. 변경하시겠습니까?"
    );

    if (!confirmed) return;

    startTransition(async () => {
      const result = await changeTeamOwner(teamId, selectedIds.owner);

      if (result.success) {
        toast.success(result.message);
        onRefetch();
        handleCancel();
      } else {
        toast.error(result.message);
      }
    });
  }, [selectedIds.owner, teamId, onRefetch, handleCancel]);

  // 부팀장 추가 핸들러
  const handleManagerAdd = useCallback(async () => {
    if (!selectedIds.managerAdd) return;

    startTransition(async () => {
      const result = await addTeamManager(teamId, selectedIds.managerAdd);

      if (result.success) {
        toast.success(result.message);
        onRefetch();
        handleCancel();
      } else {
        toast.error(result.message);
      }
    });
  }, [selectedIds.managerAdd, teamId, onRefetch, handleCancel]);

  // 부팀장 해제 핸들러
  const handleManagerRemove = useCallback(async () => {
    if (!selectedIds.managerRemove) return;

    startTransition(async () => {
      const result = await removeTeamManager(teamId, selectedIds.managerRemove);

      if (result.success) {
        toast.success(result.message);
        onRefetch();
        handleCancel();
      } else {
        toast.error(result.message);
      }
    });
  }, [selectedIds.managerRemove, teamId, onRefetch, handleCancel]);

  // 액션 설정 생성
  const actionConfigs: Record<Exclude<ActionMode, null>, ActionConfig> = {
    "change-owner": {
      icon: <ArrowsLeftRightIcon className="size-full" />,
      title: "팀장 변경",
      placeholder: "변경할 팀장을 선택하세요",
      options: options.ownerChange,
      value: selectedIds.owner,
      onChange: handleSelectionChange("owner"),
      onConfirm: handleOwnerChange,
      confirmText: "변경",
    },
    "add-manager": {
      icon: <UserPlusIcon className="size-full" />,
      title: "부팀장 추가",
      placeholder: `추가할 부팀장을 선택하세요 (${options.managerRemove.length}/2)`,
      options: options.managerAdd,
      value: selectedIds.managerAdd,
      onChange: handleSelectionChange("managerAdd"),
      onConfirm: handleManagerAdd,
      confirmText: "추가",
    },
    "remove-manager": {
      icon: <UserMinusIcon className="size-full" />,
      title: "부팀장 해제",
      placeholder: `해제할 부팀장을 선택하세요 (${options.managerRemove.length})`,
      options: options.managerRemove,
      value: selectedIds.managerRemove,
      onChange: handleSelectionChange("managerRemove"),
      onConfirm: handleManagerRemove,
      confirmText: "해제",
    },
  };

  return (
    <div className="select-none px-4">
      <div className="flex justify-between items-center py-2 min-h-13">
        <div className="flex items-center gap-2">
          <GearIcon weight="fill" className="size-7 text-zinc-500" />
          <h2 className="text-xl font-semibold">권한 설정</h2>
        </div>
      </div>

      {actionMode === null ? (
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            className={BUTTON_STYLES.action}
            onClick={() => setActionMode("change-owner")}
            disabled={isPending}
          >
            <ArrowsLeftRightIcon className="size-6 text-gray-600" />
            <span>팀장 변경</span>
          </button>
          <button
            type="button"
            className={BUTTON_STYLES.action}
            disabled={options.managerRemove.length >= 2 || isPending}
            onClick={() => setActionMode("add-manager")}
          >
            <UserPlusIcon className="size-6 text-gray-600" />
            <span>부팀장 추가</span>
          </button>
          <button
            type="button"
            className={BUTTON_STYLES.action}
            disabled={options.managerRemove.length === 0 || isPending}
            onClick={() => setActionMode("remove-manager")}
          >
            <UserMinusIcon className="size-6 text-gray-600" />
            <span>부팀장 해제</span>
          </button>
        </div>
      ) : (
        <ActionUI
          config={actionConfigs[actionMode]}
          onCancel={handleCancel}
          isPending={isPending}
        />
      )}
    </div>
  );
};

export default TeamManage;
