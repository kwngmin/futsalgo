"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
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
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Loader2, Edit, ArrowLeft } from "lucide-react";
import { POSITION_OPTIONS } from "@/shared/constants/profile";
import { Position, User } from "@prisma/client";

// 프로필 스키마 (개선된 버전)
const profileSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  email: z.string().email("올바른 이메일 형식을 입력해주세요"),
  phone: z.string().min(10, "올바른 전화번호를 입력해주세요"),
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
    .number({ error: () => "신장을 입력해주세요" })
    .min(100, "키는 100cm 이상이어야 합니다")
    .max(250, "키는 250cm 이하여야 합니다"),
  birthYear: z
    .number()
    .min(1950, "출생년도는 1950년 이후여야 합니다")
    .max(new Date().getFullYear(), "출생년도는 현재 년도 이하여야 합니다")
    .optional()
    .or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfilePageProps {
  // initialData?: Partial<ProfileFormData>;
  // lastModified?: string;
  data: User;
}

// 개별 필드 모달 컴포넌트 (DRY 원칙 적용)
const FieldModal = ({
  title,
  description,
  children,
  trigger,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  trigger: React.ReactNode;
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default function ProfileContent({
  // initialData,
  // lastModified,
  data,
}: ProfilePageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch,
    getValues,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      positions: data.positions || [],
      foot: data.foot as "LEFT" | "RIGHT" | "BOTH",
      gender: data.gender as "MALE" | "FEMALE",
      height: data.height as number,
      birthYear: data.birthYear || undefined,
    },
  });

  const selectedPositions = watch("positions");

  const togglePosition = (position: string) => {
    const current = selectedPositions || [];
    let updated: string[];

    if (current.includes(position)) {
      updated = current.filter((p) => p !== position);
    } else if (current.length < 5) {
      updated = [...current, position];
    } else {
      return;
    }

    setValue("positions", updated);
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      // API 호출 로직
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          positions: data.positions as Position[],
          birthYear: data.birthYear === "" ? undefined : data.birthYear,
        }),
      });

      if (response.ok) {
        // 성공 처리
        alert("프로필이 성공적으로 저장되었습니다.");
      } else {
        throw new Error("저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("Profile save error:", error);
      setError("root", {
        message: "처리 중 오류가 발생했습니다. 다시 시도해주세요.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const renderFieldModal = (
    field: "name" | "email" | "phone",
    title: string,
    placeholder: string
  ) => (
    <FieldModal
      title={`${title} 수정`}
      description={`새로운 ${title}을 입력해주세요.`}
      trigger={
        <div className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="font-medium">{getValues(field) || "설정되지 않음"}</p>
          </div>
          <Edit className="h-4 w-4 text-gray-400" />
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={field}>{title}</Label>
          <Input
            {...register(field)}
            id={field}
            placeholder={placeholder}
            type={
              field === "email" ? "email" : field === "phone" ? "tel" : "text"
            }
          />
          {errors[field] && (
            <Alert>
              <AlertDescription>{errors[field]?.message}</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => {}}>
            저장
          </Button>
        </DialogFooter>
      </div>
    </FieldModal>
  );

  return (
    // <div className="min-h-screen bg-gray-50">
    <div className="max-w-2xl mx-auto lg:max-w-4xl xl:max-w-2xl pb-16 flex flex-col">
      {/* 헤더 */}
      {/* <div className="bg-white border-b">
        <div className="flex items-center px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="mr-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">프로필</h1>
        </div>
      </div> */}
      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between px-6 h-16 shrink-0">
        <Button
          variant="ghost"
          size="lg"
          onClick={handleGoBack}
          className="flex items-center px-1 pl-2"
          // className="mr-2"
        >
          <ArrowLeft
            // size={32}
            // className="h-12 w-12"
            style={{ width: "24px", height: "24px" }}
          />
          <h1 className="text-2xl font-bold">프로필 정보</h1>
        </Button>
        <button className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-white rounded-full transition-colors cursor-pointer">
          {/* <Search className="w-5 h-5" /> */}
        </button>
      </div>

      <div className="px-4">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>프로필 정보</CardTitle>
            <CardDescription>
              축구 활동을 위한 기본 정보를 관리해주세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 기본 정보 섹션 */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900">기본 정보</h3>
              {renderFieldModal("name", "닉네임", "닉네임을 입력하세요")}
              {renderFieldModal("email", "이메일", "이메일을 입력하세요")}
              {renderFieldModal("phone", "전화번호", "전화번호를 입력하세요")}
            </div>

            {/* 프로필 폼 */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* 주발 */}
              <div className="space-y-3">
                <Label>주로 사용하는 발</Label>
                <RadioGroup
                  className="grid-cols-3 gap-2"
                  value={watch("foot")}
                  onValueChange={(value) =>
                    setValue("foot", value as "LEFT" | "RIGHT" | "BOTH")
                  }
                >
                  {[
                    { value: "RIGHT", label: "오른발" },
                    { value: "LEFT", label: "왼발" },
                    { value: "BOTH", label: "양발" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center space-x-2 rounded-md px-3 pb-0.5 h-8 cursor-pointer"
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value}>{option.label}</Label>
                    </label>
                  ))}
                </RadioGroup>
                {errors.foot && (
                  <Alert>
                    <AlertDescription>{errors.foot.message}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* 성별 */}
              <div className="space-y-3">
                <Label>성별</Label>
                <RadioGroup
                  className="grid-cols-2"
                  value={watch("gender")}
                  onValueChange={(value) =>
                    setValue("gender", value as "MALE" | "FEMALE")
                  }
                >
                  {[
                    { value: "MALE", label: "남성" },
                    { value: "FEMALE", label: "여성" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center space-x-2 rounded-md px-3 pb-0.5 h-8 cursor-pointer"
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value}>{option.label}</Label>
                    </label>
                  ))}
                </RadioGroup>
                {errors.gender && (
                  <Alert>
                    <AlertDescription>{errors.gender.message}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* 포지션 */}
              <div className="space-y-3">
                <Label>선호 포지션</Label>
                <div className="flex flex-wrap gap-2">
                  {POSITION_OPTIONS.map((position) => (
                    <Badge
                      key={position.value}
                      variant={
                        selectedPositions?.includes(position.value)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer text-center justify-center items-center h-8 px-3 rounded-full"
                      onClick={() => togglePosition(position.value)}
                    >
                      {`${position.value} - ${position.label}`}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  선택된 포지션: {selectedPositions?.length || 0}/5
                </p>
                {errors.positions && (
                  <Alert>
                    <AlertDescription>
                      {errors.positions.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* 신장 */}
              <div className="space-y-2">
                <Label htmlFor="height">키 (cm)</Label>
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

              {/* 출생년도 */}
              <div className="space-y-2">
                <Label htmlFor="birthYear" className="gap-1">
                  출생년도<span className="text-gray-400">(선택)</span>
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
                    <AlertDescription>
                      {errors.birthYear.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {errors.root && (
                <Alert>
                  <AlertDescription>{errors.root.message}</AlertDescription>
                </Alert>
              )}

              {/* 저장 버튼 */}
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  "저장"
                )}
              </Button>

              {/* 최근 수정일 */}
              {data.updatedAt && (
                <div className="text-center text-sm text-gray-500 pt-4 border-t">
                  최근 수정일:{" "}
                  {data.updatedAt.toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
