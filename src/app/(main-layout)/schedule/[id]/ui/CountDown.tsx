import { getRemainingTime } from "@/entities/schedule/lib/get-remaining-time";
import { useEffect, useState } from "react";

export function Countdown({ date }: { date: Date }) {
  const [timeLeft, setTimeLeft] = useState(getRemainingTime(date));

  useEffect(() => {
    const interval = setInterval(() => {
      const updated = getRemainingTime(date);
      setTimeLeft(updated);
    }, 1000);

    return () => clearInterval(interval);
  }, [date]);

  if (!timeLeft) return <span>경기 시간이 지났습니다</span>;

  const { hours, minutes, seconds } = timeLeft;

  return (
    <span>
      {hours}:{minutes}:{seconds}
    </span>
  );
}
