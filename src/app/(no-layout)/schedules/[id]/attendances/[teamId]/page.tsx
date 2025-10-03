import { prisma } from "@/shared/lib/prisma";
import ManageAttendanceContent from "./ui/ManageAttendanceContent";

const ManageAttendancePage = async ({
  params,
}: {
  params: Promise<{ id: string; teamId: string }>;
}) => {
  const { id, teamId } = await params;

  const schedule = await prisma.schedule.findUnique({
    where: {
      id,
    },
    select: {
      hostTeamId: true,
      invitedTeamId: true,
      hostTeamMercenaryCount: true,
      invitedTeamMercenaryCount: true,
    },
  });

  const teamType = schedule?.hostTeamId === teamId ? "HOST" : "INVITED";

  // 현재 팀의 용병 수 가져오기
  const currentMercenaryCount =
    teamType === "HOST"
      ? schedule?.hostTeamMercenaryCount ?? 0
      : schedule?.invitedTeamMercenaryCount ?? 0;

  const attendances = await prisma.scheduleAttendance.findMany({
    where: {
      scheduleId: id,
      teamType,
    },
    select: {
      id: true,
      attendanceStatus: true,
      user: {
        select: {
          nickname: true,
          name: true,
        },
      },
    },
  });

  return (
    <ManageAttendanceContent
      data={attendances}
      scheduleId={id}
      teamId={teamId}
      teamType={teamType}
      initialMercenaryCount={currentMercenaryCount}
    />
  );
};

export default ManageAttendancePage;
