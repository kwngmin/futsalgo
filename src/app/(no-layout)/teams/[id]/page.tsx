import { notFound } from "next/navigation";
import TeamContent from "./ui/TeamContent";

const TeamPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  if (!id || typeof id !== "string") {
    notFound();
  }

  return <TeamContent id={id} />;
};

export default TeamPage;
