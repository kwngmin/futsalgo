import { useState, useEffect } from "react";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { ValidationField } from "@/features/validation/model/types";
import { validateTeamCodeAndGetInfo } from "../action/validate-team-code-and-get-info";
// import { validateTeamCodeAndGetInfo } from "@/features/validation/model/actions/team-validation";

// 팀 정보를 포함한 ValidationField 확장
interface TeamValidationField extends ValidationField {
  team?: {
    id: string;
    name: string;
    code: string;
    city: string;
    district: string;
    logoUrl?: string;
    level: string;
    gender: string;
  };
}

export function useTeamCodeValidation() {
  const [teamCode, setTeamCode] = useState<TeamValidationField>({
    value: "",
    status: "idle",
  });

  const debouncedTeamCode = useDebounce(teamCode.value, 300);

  useEffect(() => {
    const validateTeamCode = async () => {
      if (!debouncedTeamCode) {
        setTeamCode({
          value: "",
          status: "idle",
        });
        return;
      }

      // 6자리 숫자가 아닌 경우 즉시 에러 처리
      const teamCodeRegex = /^\d{6}$/;
      if (!teamCodeRegex.test(debouncedTeamCode)) {
        setTeamCode((prev) => ({
          ...prev,
          status: "invalid",
          error: "팀 코드는 6자리 숫자여야 합니다",
          team: undefined,
        }));
        return;
      }

      // Server Action으로 검증 및 팀 정보 조회
      setTeamCode((prev) => ({
        ...prev,
        status: "checking",
        error: undefined,
        team: undefined,
      }));

      try {
        const result = await validateTeamCodeAndGetInfo(debouncedTeamCode);

        if (!result.success) {
          setTeamCode((prev) => ({
            ...prev,
            status: "invalid",
            error: result.error || "서버 오류가 발생했습니다",
            team: undefined,
          }));
          return;
        }

        if (result.isValid && result.team) {
          setTeamCode((prev) => ({
            ...prev,
            status: "valid",
            error: undefined,
            team: result.team,
          }));
        } else {
          setTeamCode((prev) => ({
            ...prev,
            status: "invalid",
            error: result.error || "존재하지 않는 팀 코드입니다",
            team: undefined,
          }));
        }
      } catch (error) {
        console.error("팀 코드 검증 오류:", error);
        setTeamCode((prev) => ({
          ...prev,
          status: "invalid",
          error: "팀 코드 확인 중 오류가 발생했습니다",
          team: undefined,
        }));
      }
    };

    validateTeamCode();
  }, [debouncedTeamCode]);

  const onChange = (raw: string) => {
    const valueWithoutSpaces = raw.replace(/\s/g, "");
    setTeamCode((prev) => ({
      ...prev,
      value: valueWithoutSpaces,
      status: "idle",
      error: undefined,
      team: undefined,
    }));
  };

  return {
    teamCode,
    setTeamCode,
    onChange,
  };
}
