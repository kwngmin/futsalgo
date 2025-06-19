export const FOOTBALL_POSITION_OPTIONS = [
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

export const FOOTBALL_POSITIONS = {
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

export const FUTSAL_POSITION_OPTIONS = [
  { value: "PIVO", label: "PIVO - 공격수" },
  { value: "ALA", label: "ALA - 측면 공격수" },
  { value: "FIXO", label: "FIXO - 수비수" },
  { value: "GOLEIRO", label: "GOLEIRO - 골키퍼" },
];

export const FUTSAL_POSITIONS = {
  PIVO: "공격수",
  ALA: "측면 공격수",
  FIXO: "수비수",
  GOLEIRO: "골키퍼",
};

export const FOOT_OPTIONS = [
  { value: "RIGHT", label: "오른발" },
  { value: "LEFT", label: "왼발" },
  { value: "BOTH", label: "양발" },
];

export const FOOT = {
  RIGHT: "오른발",
  LEFT: "왼발",
  BOTH: "양발",
} as const;

export const GENDER_OPTIONS = [
  { value: "MALE", label: "남성" },
  { value: "FEMALE", label: "여성" },
];

export const GENDER = {
  MALE: "남성",
  FEMALE: "여성",
};

export const CONDITION_OPTIONS = [
  { value: "NORMAL", label: "정상" },
  { value: "INJURED", label: "부상" },
];

export const CONDITION = {
  NORMAL: "정상",
  INJURED: "부상",
};

export const PLAYER_BACKGROUND_OPTIONS = [
  { value: "NON_PROFESSIONAL", label: "비선출" },
  { value: "PROFESSIONAL", label: "선출" },
];

export const PLAYER_BACKGROUND = {
  NON_PROFESSIONAL: "비선출",
  PROFESSIONAL: "선출",
};

export const SKILL_LEVEL_OPTIONS = [
  { value: "BEGINNER", label: "비기너 - 처음 접하거나 경험 적은 사용자" },
  { value: "AMATEUR", label: "아마추어 - 경기 참여 많고 팀 활동 경험 있음" },
  { value: "ACE", label: "에이스 - 경기 감각 좋고 잘 뛰는 사람" },
  {
    value: "SEMIPRO",
    label: "세미프로 - 전직 선수이거나, 준프로 수준 실력",
  },
];

export const SKILL_LEVEL = {
  BEGINNER: "비기너",
  AMATEUR: "아마추어",
  ACE: "에이스",
  SEMIPRO: "세미프로",
};

export const SPORT_TYPE_OPTIONS = [
  { value: "FUTSAL", label: "풋살" },
  { value: "FOOTBALL", label: "축구" },
  { value: "BOTH", label: "풋살, 축구" },
];

export const SPORT_TYPE = {
  FUTSAL: "풋살",
  FOOTBALL: "축구",
  BOTH: "풋살, 축구",
};
