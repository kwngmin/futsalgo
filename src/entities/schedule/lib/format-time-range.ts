export default function formatTimeRange({
  time,
}: {
  time: { start: Date; end: Date };
}) {
  const start = new Date(time.start);
  const end = new Date(time.end);

  // 시간 포맷 옵션
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
  };

  // full 문자열 추출 (예: 오전 06:00)
  const startStr = start.toLocaleTimeString("ko-KR", timeOptions);
  const endStr = end.toLocaleTimeString("ko-KR", timeOptions);

  // 오전/오후 구분
  const isSamePeriod =
    (startStr.includes("오전") && endStr.includes("오전")) ||
    (startStr.includes("오후") && endStr.includes("오후"));

  // 오전/오후만 추출 (ex: '오전')
  const startPeriod = startStr.slice(0, 2);
  const startTime = startStr.slice(3);
  const endTime = endStr.slice(3);

  // 최종 포맷
  const timeRange = isSamePeriod
    ? `${startPeriod} ${startTime} ~ ${endTime}`
    : `${startStr} ~ ${endStr}`;

  return timeRange;
}
