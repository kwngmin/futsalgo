import PlayerContent from "./ui/PlayerContent";

const PlayerPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;

  return <PlayerContent id={id} />;
};

export default PlayerPage;
