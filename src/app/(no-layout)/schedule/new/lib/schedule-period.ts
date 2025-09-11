import { Period } from "@prisma/client";

// utils/schedule-period.ts
export const getPeriodFromHour = (hour: number): Period => {
  if (hour >= 0 && hour < 6) return "DAWN";
  if (hour >= 6 && hour < 12) return "MORNING";
  if (hour >= 12 && hour < 18) return "DAY";
  if (hour >= 18 && hour < 22) return "EVENING";
  return "NIGHT";
};

export const getPeriodFromDateTime = (dateTime: Date): Period => {
  const hour = dateTime.getHours();
  return getPeriodFromHour(hour);
};

export const getPeriodFromTimeString = (timeString: string): Period => {
  const [hour] = timeString.split(":").map(Number);
  return getPeriodFromHour(hour);
};
