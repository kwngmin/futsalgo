"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useTeamNameValidation } from "@/features/validation/hooks/use-team-name-validation";
import { updateTeamName } from "../model/actions";
import { useRouter } from "next/navigation";

interface EditTeamNameProps {
  currentName: string;
  teamId: string;
  onSuccess: () => void;
}

/**
 * 팀 이름 변경 컴포넌트
 * @param currentName 현재 팀 이름
 * @param teamId 팀 ID
 * @param onSuccess 성공 시 콜백
 */
export default function EditTeamName({
  currentName,
  teamId,
  onSuccess,
}: EditTeamNameProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 팀 이름 validation hook (수정 시 현재 팀 ID 전달)
  const {
    teamName,
    onChange: onTeamNameChange,
    setTeamName,
  } = useTeamNameValidation(teamId);

  // 초기값 설정
  useState(() => {
    setTeamName({
      value: currentName,
      status: "idle",
    });
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // validation 체크
    if (teamName.status === "invalid" || teamName.status === "checking") {
      return;
    }

    if (teamName.value.trim() === currentName.trim()) {
      onSuccess();
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateTeamName({
        teamId,
        name: teamName.value.trim(),
      });

      if (result.success) {
        onSuccess();
        router.refresh();
      } else {
        alert(result.error || "팀 이름 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("팀 이름 변경 오류:", error);
      alert("팀 이름 변경에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <Label htmlFor="teamName">팀 이름</Label>
        <Input
          id="teamName"
          type="text"
          placeholder="팀 이름을 입력하세요"
          value={teamName.value}
          onChange={(e) => onTeamNameChange(e.target.value)}
          disabled={isSubmitting}
        />
        {teamName.status === "checking" && (
          <p className="text-sm text-blue-600">
            팀 이름을 확인하고 있습니다...
          </p>
        )}
        {teamName.status === "valid" && (
          <p className="text-sm text-green-600">사용 가능한 팀 이름입니다.</p>
        )}
        {teamName.status === "invalid" && teamName.error && (
          <p className="text-sm text-red-600">{teamName.error}</p>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          disabled={
            isSubmitting ||
            teamName.status === "invalid" ||
            teamName.status === "checking" ||
            teamName.value.trim() === currentName.trim()
          }
          className="flex-1"
        >
          {isSubmitting ? "변경 중..." : "변경하기"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onSuccess}
          disabled={isSubmitting}
          className="flex-1"
        >
          취소
        </Button>
      </div>
    </form>
  );
}
