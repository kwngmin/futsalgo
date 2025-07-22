import { auth } from "@/shared/lib/auth";

const MatchPage = async ({
  params,
}: {
  params: Promise<{ id: string; order: string }>;
}) => {
  const { order } = await params;
  const session = await auth();
  console.log(session);
  return <div>MatchPage {order}</div>;
};

export default MatchPage;
