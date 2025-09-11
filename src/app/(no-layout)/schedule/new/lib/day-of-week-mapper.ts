import { DayOfWeek } from "@prisma/client";

export function getDayOfWeekFromDate(date: Date | string): DayOfWeek {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const dayIndex = dateObj.getDay();

  // JavaScript: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  // Prisma Enum: SUNDAY, MONDAY, ..., SATURDAY
  const dayMapping: DayOfWeek[] = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];

  return dayMapping[dayIndex] as DayOfWeek;
}
