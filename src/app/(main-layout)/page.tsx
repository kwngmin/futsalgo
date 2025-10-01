import { Suspense } from "react";
import SchedulePageLoading from "./home/ui/loading";
import { getSchedules } from "./home/actions/get-schedules";
import SchedulesInfiniteClient from "./home/ui/SchedulesInfiniteClient";

export default async function HomePage(props: {
  searchParams: Promise<{ search?: string }>;
}) {
  const searchParams = await props.searchParams;

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      <Suspense fallback={<SchedulePageLoading isPage />}>
        <ScheduleDataFetcher searchQuery={searchParams.search} />
      </Suspense>
    </div>
  );
}

async function ScheduleDataFetcher({ searchQuery }: { searchQuery?: string }) {
  const initialData = await getSchedules({
    searchQuery,
    page: 1,
    pageSize: 20,
  });

  return <SchedulesInfiniteClient initialData={initialData} />;
}
