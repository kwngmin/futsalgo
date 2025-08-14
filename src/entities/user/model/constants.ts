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
  { value: "ALA", label: "ALA - 윙어 겸 미드필더" },
  { value: "FIXO", label: "FIXO - 수비수" },
  { value: "GOLEIRO", label: "GOLEIRO - 골키퍼" },
];

export const FUTSAL_POSITIONS = {
  PIVO: "공격수",
  ALA: "윙어 겸 미드필더",
  FIXO: "수비수",
  GOLEIRO: "골키퍼",
};

export const POSITION_DESCRIPTION = {
  PIVO: "최전방 공격수로, 볼을 지키고 동료에게 연결",
  ALA: "윙어처럼 측면에서 공격을 지원하고, 적극적으로 수비 가담",
  FIXO: "수비형 미드필더 또는 수비수로, 상대 공격을 차단하고 빌드업을 지원",
  GOLEIRO: "골키퍼로, 팀의 마지막 수비수이자 공격의 시작",
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
  { value: "MALE", label: "남자" },
  { value: "FEMALE", label: "여자" },
];

export const GENDER = {
  MALE: "남자",
  FEMALE: "여자",
};

export const CONDITION_OPTIONS = [
  { value: "NORMAL", label: "없음" },
  { value: "INJURED", label: "부상 중" },
];

export const CONDITION = {
  NORMAL: "없음",
  INJURED: "부상 중",
};

export const PLAYER_BACKGROUND_OPTIONS = [
  { value: "NON_PROFESSIONAL", label: "비선수" },
  { value: "PROFESSIONAL", label: "선수" },
];

export const PLAYER_BACKGROUND = {
  NON_PROFESSIONAL: "비선수",
  PROFESSIONAL: "선수",
};

export const SKILL_LEVEL_OPTIONS = [
  { value: "BEGINNER", label: "처음 접하거나 경험 적은 사용자" },
  { value: "AMATEUR", label: "경기 참여 많고 팀 활동 경험 있음" },
  { value: "ACE", label: "경기 감각 좋고 잘 뛰는 사람" },
  {
    value: "SEMIPRO",
    label: "전직 선수이거나, 준프로 수준 실력",
  },
];

export const SKILL_LEVEL = {
  BEGINNER: "초보",
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
