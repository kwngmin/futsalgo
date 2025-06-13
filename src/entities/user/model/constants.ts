export const POSITION_OPTIONS = [
  { value: "ST", label: "스트라이커" },
  { value: "LW", label: "왼쪽 윙어" },
  { value: "RW", label: "오른쪽 윙어" },
  { value: "AM", label: "중앙 공격형 미드필더" },
  { value: "CM", label: "중앙 미드필더" },
  { value: "DM", label: "중앙 수비형 미드필더" },
  { value: "CB", label: "중앙 수비수" },
  { value: "LB", label: "왼쪽 수비수" },
  { value: "RB", label: "오른쪽 수비수" },
  { value: "GK", label: "골키퍼" },
];

export const POSITIONS = {
  ST: "스트라이커",
  LW: "왼쪽 윙어",
  RW: "오른쪽 윙어",
  AM: "중앙 공격형 미드필더",
  CM: "중앙 미드필더",
  DM: "중앙 수비형 미드필더",
  CB: "중앙 수비수",
  LB: "왼쪽 수비수",
  RB: "오른쪽 수비수",
  GK: "골키퍼",
};

export const FOOT_OPTIONS = [
  { value: "LEFT", label: "왼발" },
  { value: "RIGHT", label: "오른발" },
  { value: "BOTH", label: "양발" },
];

export const FOOT = {
  LEFT: "왼발",
  RIGHT: "오른발",
  BOTH: "양발",
} as const;

export const GENDER_OPTIONS = [
  { value: "MALE", label: "남자" },
  { value: "FEMALE", label: "여자" },
];

export const GENDER = {
  MALE: "남자",
  FEMALE: "여자",
};

export const CONDITION_OPTIONS = [
  { value: "NORMAL", label: "정상" },
  { value: "INJURED", label: "부상" },
];

export const CONDITION = {
  NORMAL: "정상",
  INJURED: "부상",
};
