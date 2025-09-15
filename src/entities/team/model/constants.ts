import { FilterOption } from "@/features/filter-list/model/types";
import {
  FunnelIcon,
  HandshakeIcon,
  MagicWandIcon,
  MapPinAreaIcon,
  UsersIcon,
} from "@phosphor-icons/react";

export const TEAM_GENDER_OPTIONS = [
  { value: "MIXED", label: "혼성팀" },
  { value: "MALE", label: "남성팀" },
  { value: "FEMALE", label: "여성팀" },
];

export const TEAM_GENDER = {
  MIXED: "혼성팀",
  MALE: "남성팀",
  FEMALE: "여성팀",
};

export const TEAM_LEVEL_OPTIONS = [
  {
    value: "VERY_LOW",
    label: "하하하 - 왕초보 팀. 체력이나 풋살 경험이 부족",
  },
  { value: "LOW", label: "하하 - 일반인 팀에서 초보 팀. 기본기 부족" },
  {
    value: "MID",
    label: "하 - 일반인 팀인데 발이 좀 맞는 팀. 팀워크 존재",
  },
  {
    value: "HIGH",
    label: "중하 - 선출이랑 발 맞추는게 가능한 팀",
  },
  {
    value: "VERY_HIGH",
    label: "중 - 전원 선출이거나, 비선출 중 킹반인급만 모인 팀",
  },
];

export const TEAM_LEVEL = {
  VERY_LOW: "하",
  LOW: "중하",
  MID: "중",
  HIGH: "중상",
  VERY_HIGH: "상",
};

export const TEAM_LEVEL_DESCRIPTION = {
  VERY_LOW: "체력이나 경험이 부족한 왕초보 팀",
  LOW: "일반인 팀에서 기본기 부족한 초보 팀",
  MID: "일반인 팀인데 발이 좀 맞는 팀",
  HIGH: "선출이랑 발 맞추는게 가능한 팀",
  VERY_HIGH: "선출 또는 비선출 중 킹반인만 모인 팀",
};

export const TEAM_RECRUITMENT_STATUS_OPTIONS = [
  { value: "RECRUITING", label: "모집중" },
  { value: "NOT_RECRUITING", label: "모집마감" },
];

export const TEAM_RECRUITMENT_STATUS = {
  RECRUITING: "모집중",
  NOT_RECRUITING: "모집마감",
};

// 필터 옵션 설정
export const TEAM_FILTER_OPTIONS: FilterOption[] = [
  {
    icon: FunnelIcon,
    label: "분류",
    value: "gender",
  },
  {
    icon: MapPinAreaIcon,
    label: "지역",
    value: "location",
  },
  {
    icon: UsersIcon,
    label: "팀원모집",
    value: "recruitment",
  },
  {
    icon: HandshakeIcon,
    label: "친선전",
    value: "teamMatchAvailable",
  },
  {
    icon: MagicWandIcon,
    label: "실력",
    value: "teamLevel",
  },
];
