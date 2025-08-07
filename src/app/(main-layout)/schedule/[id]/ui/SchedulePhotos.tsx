"use client";

import { useSession } from "next-auth/react";
import SchedulePhoto from "./SchedulePhoto";

const SchedulePhotos = ({ scheduleId }: { scheduleId: string }) => {
  console.log(scheduleId);
  const session = useSession();
  const sessionUser = session.data?.user;
  console.log(sessionUser);

  return (
    <div className="mt-4 px-4">
      <button
        type="button"
        className=""
        // className={`rounded-md px-3 w-full flex items-center justify-between h-12 sm:h-11 gap-3 bg-gray-50 ${
        //   onClick
        //     ? "hover:bg-gray-100 border transition-colors cursor-pointer"
        //     : ""
        // }`}
        // onClick={onClick}
      >
        <div className="flex items-center gap-2">
          {/* {logoUrl ? (
            <Image
              src={logoUrl}
              alt="team_logo"
              width={24}
              height={24}
              className="rounded-lg"
            />
          ) : (
            <div className="size-6 rounded-lg bg-gray-200" />
          )} */}
          {/* <span className="text-base font-medium">사진 업로드</span> */}
        </div>
        {/* {isManageableTeam && (
          <div className="flex items-center gap-1">
            <span className="text-base font-medium text-gray-500">
              참석 관리
            </span>
            <ChevronRight className="size-5 text-gray-400" />
          </div>
        )} */}
      </button>
      {sessionUser?.id && (
        <SchedulePhoto scheduleId={scheduleId} userId={sessionUser?.id} />
      )}
    </div>
  );
};

export default SchedulePhotos;
