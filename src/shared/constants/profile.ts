export const POSITION_OPTIONS = [
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

export const POSITIONS = {
  FW: "포워드",
  CF: "센터 포워드",
  ST: "스트라이커",
  LWF: "레프트 윙 포워드",
  RWF: "라이트 윙 포워드",
  LW: "레프트 윙",
  RW: "라이트 윙",
  MF: "미드필더",
  CAM: "공격형 미드필더",
  CM: "센터 미드필더",
  CDM: "수비형 미드필더",
  LM: "레프트 미드필더",
  RM: "라이트 미드필더",
  DF: "수비수",
  CB: "센터백",
  LB: "레프트백",
  RB: "라이트백",
  LWB: "레프트 윙백",
  RWB: "라이트 윙백",
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
  { value: "MALE", label: "남성" },
  { value: "FEMALE", label: "여성" },
];

export const GENDER = {
  MALE: "남성",
  FEMALE: "여성",
};
