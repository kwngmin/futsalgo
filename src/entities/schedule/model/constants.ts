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
