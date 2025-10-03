import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { redirect } from "next/navigation";
import AddMatchContent from "./ui/AddMatchContent";

const AddMatchPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const scheduleId = id;
  if (!scheduleId) return redirect("/");

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return redirect("/");

  // 로그인 및 유저 확인
  const attendance = await prisma.scheduleAttendance.findUnique({
    where: {
      scheduleId_userId: {
        scheduleId,
        userId,
      },
    },
    select: {
      teamType: true,
    },
  });

  console.log(attendance, "attendance");
  if (!attendance) return redirect(`/schedules/${scheduleId}`);

  // 참가자 정보만 최소로 조회 (이후 Content에 넘길 값)
  const attendances = await prisma.scheduleAttendance.findMany({
    where: {
      scheduleId,
      teamType: attendance.teamType,
      attendanceStatus: "ATTENDING",
    },
    select: {
      attendanceStatus: true,
      teamType: true,
      user: {
        select: {
          nickname: true,
          name: true,
        },
      },
    },
  });
  console.log(attendances, "attendances");

  const schedule = await prisma.schedule.findUnique({
    where: {
      id: scheduleId,
    },
    select: {
      matchType: true,
      hostTeamId: true,
      invitedTeamId: true,
    },
  });

  console.log(schedule, "schedule");

  return <AddMatchContent scheduleId={scheduleId} />;
};

export default AddMatchPage;
