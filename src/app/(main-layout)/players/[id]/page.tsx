import { notFound } from "next/navigation";
import PlayerContent from "./ui/PlayerContent";

const PlayerPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  if (!id || typeof id !== "string") {
    notFound();
  }

  return <PlayerContent id={id} />;
};

export default PlayerPage;
