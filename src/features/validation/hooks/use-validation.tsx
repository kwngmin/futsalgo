import { useState, useEffect } from "react";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { ValidationField } from "@/features/validation/model/types";
import { validateField } from "../model/actions";

export function usePhoneValidation() {
  const [phone, setPhone] = useState<ValidationField>({
    value: "",
    status: "idle",
  });

  const debouncedPhone = useDebounce(phone.value, 300);

  useEffect(() => {
    if (debouncedPhone) {
      const phoneRegex = /^01[0-9]-?\d{3,4}-?\d{4}$/;
      if (debouncedPhone.length > 9) {
        if (phoneRegex.test(debouncedPhone)) {
          validateField("phone", debouncedPhone, setPhone);
        } else {
          setPhone((prev) => ({
            ...prev,
            status: "invalid",
            error: "올바른 전화번호 형식이 아닙니다",
          }));
        }
      }
    } else {
      setPhone({
        value: "",
        status: "idle",
      });
    }
  }, [debouncedPhone]);

  const onChange = (raw: string) => {
    const onlyNumbers = raw.replace(/\D/g, "");
    setPhone((prev) => ({
      ...prev,
      value: onlyNumbers,
      status: "idle",
      error: undefined,
    }));
  };

  return {
    phone,
    setPhone,
    onChange,
  };
}

export function useNicknameValidation() {
  const [nickname, setNickname] = useState<ValidationField>({
    value: "",
    status: "idle",
  });

  const debouncedNickname = useDebounce(nickname.value, 300);

  useEffect(() => {
    const nicknameRegex = /^[가-힣a-zA-Z0-9]+$/;
    if (debouncedNickname) {
      if (
        debouncedNickname.length >= 2 &&
        debouncedNickname.length <= 20 &&
        nicknameRegex.test(debouncedNickname)
      ) {
        validateField("nickname", debouncedNickname, setNickname);
      } else {
        setNickname((prev) => ({
          ...prev,
          status: "invalid",
          error: "닉네임은 2-20자의 한글, 영문, 숫자만 가능합니다",
        }));
      }
    } else {
      setNickname({
        value: "",
        status: "idle",
      });
    }
  }, [debouncedNickname]);

  const onChange = (raw: string) => {
    const valueWithoutSpaces = raw.replace(/\s/g, ""); // 모든 공백 제거
    setNickname((prev) => ({
      ...prev,
      value: valueWithoutSpaces,
      status: "idle",
      error: undefined,
    }));
  };

  return {
    nickname,
    setNickname,
    onChange,
  };
}

export function useEmailValidation() {
  const [email, setEmail] = useState<ValidationField>({
    value: "",
    status: "idle",
  });

  const debouncedEmail = useDebounce(email.value, 300);

  useEffect(() => {
    if (debouncedEmail) {
      validateField("email", debouncedEmail, setEmail);
    } else {
      setEmail({
        value: "",
        status: "idle",
      });
    }
  }, [debouncedEmail]);

  const onChange = (raw: string) => {
    setEmail((prev) => ({
      ...prev,
      value: raw,
      status: "idle",
      error: undefined,
    }));
  };

  return {
    email,
    setEmail,
    onChange,
  };
}

export function useTeamCodeValidation() {
  const [teamCode, setTeamCode] = useState<ValidationField>({
    value: "",
    status: "idle",
  });

  const debouncedTeamCode = useDebounce(teamCode.value, 300);

  useEffect(() => {
    const teamCodeRegex = /^\d{6}$/;
    if (debouncedTeamCode) {
      if (
        debouncedTeamCode.length === 6 &&
        teamCodeRegex.test(debouncedTeamCode)
      ) {
        const result = validateField(
          "teamCode",
          debouncedTeamCode,
          setTeamCode
        );
        console.log(result, "result");
      } else {
        setTeamCode((prev) => ({
          ...prev,
          status: "invalid",
          error: "사용할 수 없는 팀 코드입니다",
        }));
      }
    } else {
      setTeamCode({
        value: "",
        status: "idle",
      });
    }
  }, [debouncedTeamCode]);

  const onChange = (raw: string) => {
    const valueWithoutSpaces = raw.replace(/\s/g, ""); // 모든 공백 제거
    setTeamCode((prev) => ({
      ...prev,
      value: valueWithoutSpaces,
      status: "idle",
      error: undefined,
    }));
  };

  return {
    teamCode,
    setTeamCode,
    onChange,
  };
}
