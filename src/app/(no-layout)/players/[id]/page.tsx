import PlayerContent from "./ui/PlayerContent";

const PlayerPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;

  if (!id) {
    return <div>선수를 찾을 수 없습니다.</div>;
  }

  return <PlayerContent id={id} />;
};

export default PlayerPage;
