export const SCHEDULE_STATUS = {
  PENDING: "PENDING",
  READY: "READY",
  REJECTED: "REJECTED",
  PLAY: "PLAY",
} as const;

export const SCHEDULE_STATUS_LABEL = {
  PENDING: "상대팀 수락 대기중",
  READY: "준비완료 (경기 시작 가능)",
  REJECTED: "거절됨",
  PLAY: "경기중",
  COMPLETED: "경기종료",
} as const;

export const MATCH_TYPE_OPTIONS = [
  { value: "SQUAD", label: "연습경기 - 우리 팀끼리 연습경기" },
  { value: "TEAM", label: "친선경기 - 다른 팀과의 친선경기" },
];

export const MATCH_TYPE = {
  SQUAD: "연습경기",
  TEAM: "친선경기",
};
