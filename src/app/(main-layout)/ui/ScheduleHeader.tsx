"use client";

import { usePathname } from "next/navigation";

const ScheduleHeader = () => {
  const pathname = usePathname();
  console.log(pathname, "pathname");

  return <div>ScheduleHeader</div>;
};

export default ScheduleHeader;
