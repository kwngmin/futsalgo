import { getTournamentNews } from "./actions/get-tournament-news";
import NewsInfiniteClient from "./ui/NewsInfiniteClient";

interface Props {
  searchParams: Promise<{ search?: string }>;
}

/**
 * 대회 소식 페이지
 */
const NewsPage = async ({ searchParams }: Props) => {
  const resolvedSearchParams = await searchParams;
  const searchQuery =
    typeof resolvedSearchParams.search === "string"
      ? resolvedSearchParams.search
      : undefined;

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
