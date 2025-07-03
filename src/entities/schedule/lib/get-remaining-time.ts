export function getRemainingTime(date: Date) {
  const now = new Date();
  const endOfDay = new Date(`${date}T23:59:59`);

  const diffMs = endOfDay.getTime() - now.getTime();
  if (diffMs <= 0) return null; // 이미 지난 경우

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
}
