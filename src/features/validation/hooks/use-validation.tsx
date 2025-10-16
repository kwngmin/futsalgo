import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { ValidationField } from "@/features/validation/model/types";
import {
  checkEmailAvailability,
  checkNicknameAvailability,
  checkPhoneAvailability,
  checkTeamCodeAvailability,
} from "../model/actions";

// 검증 규칙 타입
interface ValidationRule {
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  errorMessage: string;
  preprocessor?: (value: string) => string;
}

// 검증 규칙 정의
const VALIDATION_RULES: Record<string, ValidationRule> = {
  phone: {
    pattern: /^01[0-9]-?\d{3,4}-?\d{4}$/,
    minLength: 10,
    errorMessage: "올바른 전화번호 형식이 아닙니다",
    preprocessor: (value) => value.replace(/\D/g, ""), // 숫자만 추출
  },
  nickname: {
    pattern: /^[가-힣a-zA-Z0-9]+$/,
    minLength: 2,
    maxLength: 20,
    errorMessage: "닉네임은 2-20자의 한글, 영문, 숫자만 가능합니다",
    preprocessor: (value) => value.replace(/\s/g, ""), // 공백 제거
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // 이메일 패턴 추가
    errorMessage: "올바른 이메일 형식이 아닙니다",
    preprocessor: (value) => value.trim(),
  },
  teamCode: {
    pattern: /^\d{6}$/,
    minLength: 6,
    maxLength: 6,
    errorMessage: "팀 코드는 6자리 숫자여야 합니다",
    preprocessor: (value) => value.replace(/\s/g, ""), // 공백 제거
  },
};

// 서버 검증 함수 매핑
const SERVER_VALIDATORS = {
  phone: checkPhoneAvailability,
  nickname: checkNicknameAvailability,
  email: checkEmailAvailability,
  teamCode: checkTeamCodeAvailability,
} as const;

// 기본 유효성 검증 함수
function validateFormat(
  value: string,
  rule: ValidationRule
): { isValid: boolean; error?: string } {
  // 길이 검증
  if (rule.minLength && value.length < rule.minLength) {
    return { isValid: false, error: rule.errorMessage };
  }
  if (rule.maxLength && value.length > rule.maxLength) {
    return { isValid: false, error: rule.errorMessage };
  }

  // 패턴 검증
  if (rule.pattern && !rule.pattern.test(value)) {
    return { isValid: false, error: rule.errorMessage };
  }

  return { isValid: true };
}

// 재사용 가능한 검증 Hook
function useValidation(
  fieldType: keyof typeof VALIDATION_RULES,
  debounceMs: number = 300
) {
  const [field, setField] = useState<ValidationField>({
    value: "",
    status: "idle",
  });

  const debouncedValue = useDebounce(field.value, debounceMs);
  const rule = VALIDATION_RULES[fieldType];
  const serverValidator =
    SERVER_VALIDATORS[fieldType as keyof typeof SERVER_VALIDATORS];

  // 서버 검증 수행
  const performServerValidation = useCallback(
    async (value: string) => {
      try {
        setField((prev) => ({
          ...prev,
          status: "checking",
          error: undefined,
        }));

        const result = await serverValidator(value);

        if (result.success) {
          if (result.isDuplicate) {
            setField((prev) => ({
              ...prev,
              status: "invalid",
              error: result.message,
            }));
          } else {
            setField((prev) => ({
              ...prev,
              status: "valid",
              error: undefined,
            }));
          }
        } else {
          setField((prev) => ({
            ...prev,
            status: "invalid",
            error: result.error || "검증 중 오류가 발생했습니다.",
          }));
        }
      } catch (error) {
        console.error(`${fieldType} validation error:`, error);
        setField((prev) => ({
          ...prev,
          status: "invalid",
          error: "검증 중 오류가 발생했습니다.",
        }));
      }
    },
    [fieldType, serverValidator]
  );

  // 디바운스된 값 변경 시 검증
  useEffect(() => {
    if (!debouncedValue) {
      setField({
        value: "",
        status: "idle",
      });
      return;
    }

    // 클라이언트 측 형식 검증
    const formatValidation = validateFormat(debouncedValue, rule);

    if (!formatValidation.isValid) {
      setField((prev) => ({
        ...prev,
        status: "invalid",
        error: formatValidation.error,
      }));
      return;
    }

    // 서버 측 중복 검증
    performServerValidation(debouncedValue);
  }, [debouncedValue, rule, performServerValidation]);

  // onChange 핸들러
  const onChange = useCallback(
    (raw: string) => {
      const processedValue = rule.preprocessor ? rule.preprocessor(raw) : raw;

      setField((prev) => ({
        ...prev,
        value: processedValue,
        status: "idle",
        error: undefined,
      }));
    },
    [rule]
  );

  return {
    field,
    setField,
    onChange,
    // 편의를 위한 추가 속성
    value: field.value,
    status: field.status,
    error: field.error,
  };
}

// 특화된 Hook들 - 기존 API 유지
export function usePhoneValidation() {
  const { field: phone, setField: setPhone, onChange } = useValidation("phone");
  return { phone, setPhone, onChange };
}

export function useNicknameValidation() {
  const {
    field: nickname,
    setField: setNickname,
    onChange,
  } = useValidation("nickname");
  return { nickname, setNickname, onChange };
}

export function useEmailValidation() {
  const { field: email, setField: setEmail, onChange } = useValidation("email");
  return { email, setEmail, onChange };
}

export function useTeamCodeValidation() {
  const {
    field: teamCode,
    setField: setTeamCode,
    onChange,
  } = useValidation("teamCode");
  return { teamCode, setTeamCode, onChange };
}
