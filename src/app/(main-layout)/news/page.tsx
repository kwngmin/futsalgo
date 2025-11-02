import { getTournamentNews } from "./actions/get-tournament-news";
import NewsInfiniteClient from "./ui/NewsInfiniteClient";

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

/**
 * 대회 소식 페이지
 */
const NewsPage = async ({ searchParams }: Props) => {
  const searchQuery =
    typeof searchParams.search === "string" ? searchParams.search : undefined;

  // 초기 데이터 가져오기
  const initialData = await getTournamentNews({
    searchQuery,
    page: 1,
    pageSize: 20,
    tab: "all",
  });

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      <NewsInfiniteClient initialData={initialData} searchQuery={searchQuery} />
    </div>
  );
};

export default NewsPage;
