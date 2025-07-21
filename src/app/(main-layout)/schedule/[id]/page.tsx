import { auth } from "@/shared/lib/auth";
import ScheduleContent from "./ui/ScheduleContent";
import { prisma } from "@/shared/lib/prisma";

const MatchesPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user.id;
  if (userId) {
    // 이미 좋아요 되어있는지 확인
    const isLiked = await prisma.scheduleLike.findUnique({
      where: {
        scheduleId_userId: {
          scheduleId: id,
          userId,
        },
      },
    });
    return (
      <ScheduleContent scheduleId={id} isLikedSchedule={Boolean(isLiked)} />
    );
  }
  return <ScheduleContent scheduleId={id} />;
};

export default MatchesPage;
