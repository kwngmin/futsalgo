import { auth } from "@/shared/lib/auth";
import ScheduleContent from "./ui/ScheduleContent";

const MatchesPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const session = await auth();
  console.log(session);
  return <ScheduleContent scheduleId={id} />;
};

export default MatchesPage;
