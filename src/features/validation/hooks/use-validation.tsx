import { useState, useEffect, useCallback, useRef } from "react";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { ValidationField } from "@/features/validation/model/types";
import {
  checkEmailAvailability,
  checkNicknameAvailability,
  checkPhoneAvailability,
  checkTeamCodeAvailability,
} from "../model/actions";

// 타입 정의 개선
type FieldType = "phone" | "nickname" | "email" | "teamCode";

interface ValidationRule {
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  errorMessage: string;
  preprocessor?: (value: string) => string;
}

// 서버 검증 함수 타입
type ServerValidator = (value: string) => Promise<{
  success: boolean;
  isDuplicate?: boolean;
  message?: string;
  error?: string;
}>;

// 검증 Hook 반환 타입
interface ValidationHookReturn {
  field: ValidationField;
  setField: React.Dispatch<React.SetStateAction<ValidationField>>;
  onChange: (value: string) => void;
  onCompositionStart: () => void;
  onCompositionEnd: (value: string) => void;
  value: string;
  status: ValidationField["status"];
  error?: string;
}

// 검증 규칙 정의
const VALIDATION_RULES: Record<FieldType, ValidationRule> = {
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
const SERVER_VALIDATORS: Record<FieldType, ServerValidator> = {
  phone: checkPhoneAvailability,
  nickname: checkNicknameAvailability,
  email: checkEmailAvailability,
  teamCode: checkTeamCodeAvailability,
};

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
  fieldType: FieldType,
  debounceMs: number = 300
): ValidationHookReturn {
  const [field, setField] = useState<ValidationField>({
    value: "",
    status: "idle",
  });

  // IME 조합 상태 추적
  const isComposingRef = useRef(false);
  const debouncedValue = useDebounce(field.value, debounceMs);
  const rule = VALIDATION_RULES[fieldType];
  const serverValidator = SERVER_VALIDATORS[fieldType];

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
    // IME 조합 중이면 검증 건너뛰기
    if (isComposingRef.current) {
      return;
    }

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

  // IME 이벤트 핸들러들
  const onCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const onCompositionEnd = useCallback(
    (value: string) => {
      isComposingRef.current = false;
      // composition 종료 시 최종 값으로 업데이트
      onChange(value);
    },
    [onChange]
  );

  return {
    field,
    setField,
    onChange,
    onCompositionStart,
    onCompositionEnd,
    // 편의를 위한 추가 속성
    value: field.value,
    status: field.status,
    error: field.error,
  };
}

// 특화된 Hook들 - 명확한 타입과 함께 원본 API 유지
export function usePhoneValidation() {
  const validation = useValidation("phone");
  return {
    phone: validation.field,
    setPhone: validation.setField,
    onChange: validation.onChange,
    onCompositionStart: validation.onCompositionStart,
    onCompositionEnd: validation.onCompositionEnd,
  };
}

export function useNicknameValidation() {
  const validation = useValidation("nickname", 500);
  return {
    nickname: validation.field,
    setNickname: validation.setField,
    onChange: validation.onChange,
    onCompositionStart: validation.onCompositionStart,
    onCompositionEnd: validation.onCompositionEnd,
  };
}

export function useEmailValidation() {
  const validation = useValidation("email");
  return {
    email: validation.field,
    setEmail: validation.setField,
    onChange: validation.onChange,
    onCompositionStart: validation.onCompositionStart,
    onCompositionEnd: validation.onCompositionEnd,
  };
}

export function useTeamCodeValidation() {
  const validation = useValidation("teamCode");
  return {
    teamCode: validation.field,
    setTeamCode: validation.setField,
    onChange: validation.onChange,
    onCompositionStart: validation.onCompositionStart,
    onCompositionEnd: validation.onCompositionEnd,
  };
}
