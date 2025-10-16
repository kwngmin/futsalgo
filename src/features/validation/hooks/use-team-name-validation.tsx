import { useState, useEffect } from "react";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { ValidationField } from "@/features/validation/model/types";
import { checkTeamNameAvailability } from "@/features/validation/model/actions";

/**
 * 팀 이름 중복 검증을 위한 커스텀 훅
 * @param teamId 수정 시 현재 팀 ID (선택사항)
 * @returns 팀 이름 validation 상태와 핸들러
 */
export function useTeamNameValidation(teamId?: string) {
  const [teamName, setTeamName] = useState<ValidationField>({
    value: "",
    status: "idle",
  });

  const debouncedTeamName = useDebounce(teamName.value, 500);

  useEffect(() => {
    if (debouncedTeamName) {
      const trimmedName = debouncedTeamName.trim();

      if (trimmedName.length === 0) {
        setTeamName((prev) => ({
          ...prev,
          status: "invalid",
          error: "팀 이름을 입력해주세요.",
        }));
        return;
      }

      // 중복 검증 API 호출
      validateTeamName(trimmedName, teamId, setTeamName);
    } else {
      setTeamName({
        value: "",
        status: "idle",
      });
    }
  }, [debouncedTeamName, teamId]);

  const onChange = (raw: string) => {
    setTeamName((prev) => ({
      ...prev,
      value: raw,
      status: "idle",
      error: undefined,
    }));
  };

  const reset = () => {
    setTeamName({
      value: "",
      status: "idle",
    });
  };

  return {
    teamName,
    setTeamName,
    onChange,
    reset,
  };
}

/**
 * 팀 이름 중복 검증 server action 호출 함수
 * @param name 검증할 팀 이름
 * @param teamId 수정 시 현재 팀 ID
 * @param setTeamName 상태 업데이트 함수
 */
async function validateTeamName(
  name: string,
  teamId: string | undefined,
  setTeamName: React.Dispatch<React.SetStateAction<ValidationField>>
) {
  try {
    setTeamName((prev) => ({
      ...prev,
      status: "checking",
    }));

    const result = await checkTeamNameAvailability({
      name,
      teamId,
    });

    if (result.success) {
      if (result.isDuplicate) {
        setTeamName((prev) => ({
          ...prev,
          status: "invalid",
          error: result.message,
        }));
      } else {
        setTeamName((prev) => ({
          ...prev,
          status: "valid",
          error: undefined,
        }));
      }
    } else {
      setTeamName((prev) => ({
        ...prev,
        status: "invalid",
        error: result.error || "검증 중 오류가 발생했습니다.",
      }));
    }
  } catch (error) {
    console.error("팀 이름 검증 오류:", error);
    setTeamName((prev) => ({
      ...prev,
      status: "invalid",
      error: "검증 중 오류가 발생했습니다.",
    }));
  }
}
