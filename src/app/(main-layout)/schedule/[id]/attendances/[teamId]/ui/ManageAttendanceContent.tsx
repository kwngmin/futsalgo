"use client";

import { Prisma } from "@prisma/client";
import { RefreshCcw, SquareCheckBig, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { addAttendances } from "../actions/addAttendances";

type AttendanceWithUser = Prisma.ScheduleAttendanceGetPayload<{
  select: {
    id: true;
    attendanceStatus: true;
    user: {
      select: {
        nickname: true;
        image: true;
      };
    };
  };
}>;

const ManageAttendanceContent = ({
  scheduleId,
  data,
  teamId,
  teamType,
}: {
  scheduleId: string;
  data: AttendanceWithUser[];
  teamId: string;
  teamType: "HOST" | "INVITED";
}) => {
  const router = useRouter();
  console.log(data, "data");
  console.log(teamId, "teamId");
  console.log(teamType, "teamType");

  // console.log(scheduleId, teamId, "scheduleId, teamId");
  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0">
        <h1 className="text-2xl font-bold">참석자 등록 관리</h1>
        <div className="flex items-center gap-2">
          <button
            className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            onClick={() =>
              router.push(`/schedule/${scheduleId}?tab=attendance`)
            }
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="px-4">
        <div className="grid grid-cols-2 gap-2">
          <div
            className="rounded-md px-3 w-full flex items-center justify-between h-12 sm:h-11 gap-3 cursor-pointer bg-gray-50 hover:bg-gray-100 border transition-colors"
            // onClick={onClick}
          >
            <div className="flex items-center gap-2">
              <SquareCheckBig className="size-5 text-gray-400" />
              <span className="text-base font-medium text-center">
                전체 참석처리
              </span>
            </div>

            <div className="flex items-center gap-1">
              {/* <span className="text-base font-medium text-gray-500">
              등록 관리
            </span> */}
            </div>
          </div>
          <div
            className="rounded-md px-3 w-full flex items-center justify-between h-12 sm:h-11 gap-3 cursor-pointer bg-gray-50 hover:bg-gray-100 border transition-colors"
            onClick={() => {
              addAttendances({ scheduleId, teamId, teamType });
            }}
          >
            <div className="flex items-center gap-2">
              <RefreshCcw className="size-5 text-gray-400" />
              <span className="text-base font-medium">팀원 업데이트</span>
            </div>

            <div className="flex items-center gap-1">
              {/* <span className="text-base font-medium text-gray-500">
              등록 관리
            </span> */}
            </div>
          </div>
        </div>
      </div>
      ManageAttendanceContent
    </div>
  );
};

export default ManageAttendanceContent;
