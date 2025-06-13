import PlayerContent from "./ui/PlayerContent";

interface PlayerPageProps {
  params: {
    id: string;
  };
}

const PlayerPage = ({ params }: PlayerPageProps) => {
  const { id } = params;

  if (!id) {
    return <div>선수를 찾을 수 없습니다.</div>;
  }

  return <PlayerContent id={id} />;
};

export default PlayerPage;
