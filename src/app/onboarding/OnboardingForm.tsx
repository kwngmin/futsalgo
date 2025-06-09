"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useSession } from "next-auth/react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/shared/components/ui/select";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Loader2, Check, X } from "lucide-react";

// 유효성 검증 스키마 (중복확인 필드 제외)
const profileSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  foot: z.enum(["LEFT", "RIGHT", "BOTH"], {
    error: () => "주발을 선택해주세요",
  }),
  gender: z.enum(["MALE", "FEMALE"], {
    error: () => "성별을 선택해주세요",
  }),
  positions: z
    .array(z.string())
    .min(1, "최소 1개의 포지션을 선택해주세요")
    .max(5, "최대 5개의 포지션까지 선택 가능합니다"),
  height: z
    .number(
      //   {
      //     invalid_type_error: "신장은 숫자여야 합니다",
      //   },
      { error: () => "신장을 입력해주세요" }
    )
    .min(100, "신장은 100cm 이상이어야 합니다")
    .max(250, "신장은 250cm 이하여야 합니다"),
  injured: z.boolean(),
  weight: z
    .number()
    .min(30, "체중은 30kg 이상이어야 합니다")
    .max(200, "체중은 200kg 이하여야 합니다")
    .optional()
    .or(z.literal("")),
  birthYear: z
    .number()
    .min(1950, "출생년도는 1950년 이후여야 합니다")
    .max(new Date().getFullYear(), "출생년도는 현재 년도 이하여야 합니다")
    .optional()
    .or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

type ValidationStep = "email" | "phone" | "nickname" | "profile" | "complete";

type ValidationStatus = "idle" | "checking" | "valid" | "invalid";

interface ValidationField {
  value: string;
  status: ValidationStatus;
  error?: string;
}

const POSITION_OPTIONS = [
  { value: "FW", label: "포워드" },
  { value: "CF", label: "센터 포워드" },
  { value: "ST", label: "스트라이커" },
  { value: "LWF", label: "레프트 윙 포워드" },
  { value: "RWF", label: "라이트 윙 포워드" },
  { value: "LW", label: "레프트 윙" },
  { value: "RW", label: "라이트 윙" },
  { value: "MF", label: "미드필더" },
  { value: "CAM", label: "공격형 미드필더" },
  { value: "CM", label: "센터 미드필더" },
  { value: "CDM", label: "수비형 미드필더" },
  { value: "LM", label: "레프트 미드필더" },
  { value: "RM", label: "라이트 미드필더" },
  { value: "DF", label: "수비수" },
  { value: "CB", label: "센터백" },
  { value: "LB", label: "레프트백" },
  { value: "RB", label: "라이트백" },
  { value: "LWB", label: "레프트 윙백" },
  { value: "RWB", label: "라이트 윙백" },
  { value: "GK", label: "골키퍼" },
];

export function OnboardingForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState<ValidationStep>(
    session?.user?.email ? "phone" : "email"
  );
  const [isLoading, setIsLoading] = useState(false);

  // 중복확인 필드들 상태
  const [email, setEmail] = useState<ValidationField>({
    value: "",
    status: "idle",
  });
  const [phone, setPhone] = useState<ValidationField>({
    value: "",
    status: "idle",
  });
  const [nickname, setNickname] = useState<ValidationField>({
    value: "",
    status: "idle",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      positions: [],
      injured: false,
    },
  });

  const selectedPositions = watch("positions");

  // 세션 데이터로 이메일 초기값 설정
  useEffect(() => {
    if (session?.user?.email) {
      setEmail((prev) => ({ ...prev, value: session.user.email! }));
    }
    if (session?.user?.name) {
      setValue("name", session.user.name);
    }
  }, [session, setValue]);

  // 중복확인 함수
  const validateField = async (
    type: "email" | "phone" | "nickname",
    value: string
  ) => {
    if (!value || value.trim() === "") return;

    const setFieldState =
      type === "email" ? setEmail : type === "phone" ? setPhone : setNickname;

    setFieldState((prev) => ({ ...prev, status: "checking" }));
    console.log(value, "value");
    try {
      const response = await fetch(`/api/check/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [type]: value }),
      });

      const data = await response.json();

      if (data.available) {
        setFieldState((prev) => ({
          ...prev,
          status: "valid",
          error: undefined,
        }));
      } else {
        setFieldState((prev) => ({
          ...prev,
          status: "invalid",
          error: `이미 사용 중인 ${
            type === "email"
              ? "이메일"
              : type === "phone"
              ? "전화번호"
              : "닉네임"
          }입니다`,
        }));
      }
    } catch (error) {
      console.error(`${type} validation error:`, error);
      setFieldState((prev) => ({
        ...prev,
        status: "invalid",
        error: "확인 중 오류가 발생했습니다",
      }));
    }
  };

  // 단계별 진행
  const handleNextStep = () => {
    if (currentStep === "email" && email.status === "valid") {
      setCurrentStep("phone");
    } else if (currentStep === "phone" && phone.status === "valid") {
      setCurrentStep("nickname");
    } else if (currentStep === "nickname" && nickname.status === "valid") {
      setCurrentStep("profile");
    }
  };

  // 포지션 토글
  const togglePosition = (position: string) => {
    const current = selectedPositions || [];
    let updated;

    if (current.includes(position)) {
      updated = current.filter((p) => p !== position);
    } else if (current.length < 5) {
      updated = [...current, position];
    } else {
      return; // 최대 5개 제한
    }

    setValue("positions", updated);
  };

  // 최종 제출
  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const fullData = {
        ...data,
        email: email.value,
        phone: phone.value,
        nickname: nickname.value,
      };

      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullData),
      });

      if (response.ok) {
        setCurrentStep("complete");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 2000);
      } else {
        const error = await response.json();
        throw new Error(error.message || "온보딩 실패");
      }
    } catch (error) {
      console.error("Onboarding error:", error);
      setError("root", {
        message: "처리 중 오류가 발생했습니다. 다시 시도해주세요.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 완료 화면
  if (currentStep === "complete") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle>온보딩 완료!</CardTitle>
          <CardDescription>잠시 후 대시보드로 이동합니다...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // 이메일 확인 단계
  if (currentStep === "email") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>이메일 확인</CardTitle>
          <CardDescription>사용할 이메일 주소를 확인해주세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={email.value}
                onChange={(e) =>
                  setEmail((prev) => ({
                    ...prev,
                    value: e.target.value,
                    status: "idle",
                  }))
                }
                onBlur={() => validateField("email", email.value)}
                placeholder="example@email.com"
              />
              {email.status === "checking" && (
                <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin" />
              )}
              {email.status === "valid" && (
                <Check className="absolute right-3 top-2.5 h-4 w-4 text-green-600" />
              )}
              {email.status === "invalid" && (
                <X className="absolute right-3 top-2.5 h-4 w-4 text-red-600" />
              )}
            </div>
            {email.error && (
              <Alert>
                <AlertDescription>{email.error}</AlertDescription>
              </Alert>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="flex-1"
            >
              나중에 하기
            </Button>
            <Button
              onClick={handleNextStep}
              disabled={email.status !== "valid"}
              className="flex-1"
            >
              다음
            </Button>
          </div>
        </CardContent>
        {/* <p>{JSON.stringify(email)}</p> */}
        {/* <p>{email.value}</p> */}
      </Card>
    );
  }

  // 전화번호 확인 단계
  if (currentStep === "phone") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>전화번호 입력</CardTitle>
          <CardDescription>
            팀원들과의 연락을 위한 전화번호를 입력해주세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">전화번호</Label>
            <div className="relative">
              <Input
                id="phone"
                type="tel"
                value={phone.value}
                onChange={(e) =>
                  setPhone((prev) => ({
                    ...prev,
                    value: e.target.value,
                    status: "idle",
                  }))
                }
                onBlur={() => {
                  const phoneRegex = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/;
                  if (phoneRegex.test(phone.value)) {
                    validateField("phone", phone.value);
                  } else {
                    setPhone((prev) => ({
                      ...prev,
                      status: "invalid",
                      error: "올바른 전화번호 형식이 아닙니다",
                    }));
                  }
                }}
                placeholder="010-1234-5678"
              />
              {phone.status === "checking" && (
                <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin" />
              )}
              {phone.status === "valid" && (
                <Check className="absolute right-3 top-2.5 h-4 w-4 text-green-600" />
              )}
              {phone.status === "invalid" && (
                <X className="absolute right-3 top-2.5 h-4 w-4 text-red-600" />
              )}
            </div>
            {phone.error && (
              <Alert>
                <AlertDescription>{phone.error}</AlertDescription>
              </Alert>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setCurrentStep("email")}
              className="flex-1"
            >
              이전
            </Button>
            <Button
              onClick={handleNextStep}
              disabled={phone.status !== "valid"}
              className="flex-1"
            >
              다음
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 닉네임 확인 단계
  if (currentStep === "nickname") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>닉네임 설정</CardTitle>
          <CardDescription>
            다른 사용자들에게 표시될 닉네임을 설정해주세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nickname">닉네임</Label>
            <div className="relative">
              <Input
                id="nickname"
                type="text"
                value={nickname.value}
                onChange={(e) =>
                  setNickname((prev) => ({
                    ...prev,
                    value: e.target.value,
                    status: "idle",
                  }))
                }
                onBlur={() => {
                  const nicknameRegex = /^[가-힣a-zA-Z0-9]+$/;
                  if (
                    nickname.value.length >= 2 &&
                    nickname.value.length <= 20 &&
                    nicknameRegex.test(nickname.value)
                  ) {
                    validateField("nickname", nickname.value);
                  } else {
                    setNickname((prev) => ({
                      ...prev,
                      status: "invalid",
                      error: "닉네임은 2-20자의 한글, 영문, 숫자만 가능합니다",
                    }));
                  }
                }}
                placeholder="닉네임을 입력하세요"
              />
              {nickname.status === "checking" && (
                <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin" />
              )}
              {nickname.status === "valid" && (
                <Check className="absolute right-3 top-2.5 h-4 w-4 text-green-600" />
              )}
              {nickname.status === "invalid" && (
                <X className="absolute right-3 top-2.5 h-4 w-4 text-red-600" />
              )}
            </div>
            {nickname.error && (
              <Alert>
                <AlertDescription>{nickname.error}</AlertDescription>
              </Alert>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setCurrentStep("phone")}
              className="flex-1"
            >
              이전
            </Button>
            <Button
              onClick={handleNextStep}
              disabled={nickname.status !== "valid"}
              className="flex-1"
            >
              다음
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 프로필 정보 입력 단계
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>프로필 정보 입력</CardTitle>
        <CardDescription>
          축구 활동을 위한 기본 정보를 입력해주세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 이름 */}
          <div className="space-y-2">
            <Label htmlFor="name">이름 *</Label>
            <Input
              {...register("name")}
              id="name"
              placeholder="이름을 입력하세요"
            />
            {errors.name && (
              <Alert>
                <AlertDescription>{errors.name.message}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* 주발 */}
          <div className="space-y-3">
            <Label>주발 *</Label>
            <RadioGroup
              onValueChange={(value) =>
                setValue("foot", value as "LEFT" | "RIGHT" | "BOTH")
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="LEFT" id="left" />
                <Label htmlFor="left">왼발</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="RIGHT" id="right" />
                <Label htmlFor="right">오른발</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="BOTH" id="both" />
                <Label htmlFor="both">양발</Label>
              </div>
            </RadioGroup>
            {errors.foot && (
              <Alert>
                <AlertDescription>{errors.foot.message}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* 성별 */}
          <div className="space-y-3">
            <Label>성별 *</Label>
            <RadioGroup
              onValueChange={(value) =>
                setValue("gender", value as "MALE" | "FEMALE")
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="MALE" id="male" />
                <Label htmlFor="male">남성</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="FEMALE" id="female" />
                <Label htmlFor="female">여성</Label>
              </div>
            </RadioGroup>
            {errors.gender && (
              <Alert>
                <AlertDescription>{errors.gender.message}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* 포지션 */}
          <div className="space-y-3">
            <Label>포지션 * (최대 5개 선택 가능)</Label>
            <div className="grid grid-cols-3 gap-2">
              {POSITION_OPTIONS.map((position) => (
                <Badge
                  key={position.value}
                  variant={
                    selectedPositions?.includes(position.value)
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer text-center justify-center p-2"
                  onClick={() => togglePosition(position.value)}
                >
                  {position.label}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              선택된 포지션: {selectedPositions?.length || 0}/5
            </p>
            {errors.positions && (
              <Alert>
                <AlertDescription>{errors.positions.message}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* 신장 */}
          <div className="space-y-2">
            <Label htmlFor="height">신장 (cm) *</Label>
            <Input
              {...register("height", { valueAsNumber: true })}
              id="height"
              type="number"
              min="100"
              max="250"
              placeholder="175"
            />
            {errors.height && (
              <Alert>
                <AlertDescription>{errors.height.message}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* 부상 여부 */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="injured"
              onCheckedChange={(checked) => setValue("injured", !!checked)}
            />
            <Label htmlFor="injured">현재 부상 중</Label>
          </div>

          {/* 체중 (선택) */}
          <div className="space-y-2">
            <Label htmlFor="weight">
              체중 (kg) <span className="text-gray-400">(선택)</span>
            </Label>
            <Input
              {...register("weight", { valueAsNumber: true })}
              id="weight"
              type="number"
              min="30"
              max="200"
              placeholder="70"
            />
            {errors.weight && (
              <Alert>
                <AlertDescription>{errors.weight.message}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* 출생년도 (선택) */}
          <div className="space-y-2">
            <Label htmlFor="birthYear">
              출생년도 <span className="text-gray-400">(선택)</span>
            </Label>
            <Input
              {...register("birthYear", { valueAsNumber: true })}
              id="birthYear"
              type="number"
              min="1950"
              max={new Date().getFullYear()}
              placeholder="1990"
            />
            {errors.birthYear && (
              <Alert>
                <AlertDescription>{errors.birthYear.message}</AlertDescription>
              </Alert>
            )}
          </div>

          {errors.root && (
            <Alert>
              <AlertDescription>{errors.root.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep("nickname")}
              className="flex-1"
            >
              이전
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                "완료"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
