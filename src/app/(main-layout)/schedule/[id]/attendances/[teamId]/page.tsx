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
    },
  });

  const teamType = schedule?.hostTeamId === teamId ? "HOST" : "INVITED";

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
          image: true,
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
    />
  );
};

export default ManageAttendancePage;
