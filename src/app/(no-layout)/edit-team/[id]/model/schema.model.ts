import { z } from "zod/v4";

export const editTeamFormSchema = z.object({
  // name: z.string().min(1, "팀 이름을 입력해주세요"),
  gender: z.enum(["MALE", "FEMALE", "MIXED"], {
    error: () => "성별을 선택해주세요",
  }),
  description: z.string().min(1, "팀 소개를 입력해주세요"),
  city: z.string().min(1, "시/도를 선택해주세요"),
  district: z.string().min(1, "구/군을 입력해주세요"),
  level: z.enum(["VERY_LOW", "LOW", "MID", "HIGH", "VERY_HIGH"], {
    error: () => "팀 실력을 선택해주세요",
  }),
  recruitmentStatus: z.enum(["RECRUITING", "NOT_RECRUITING"], {
    error: () => "팀원 모집 상태를 선택해주세요",
  }),
  teamMatchAvailable: z.enum(["AVAILABLE", "UNAVAILABLE"], {
    error: () => "친선전 초청 가능 여부를 선택해주세요",
  }),
});
