import { Suspense } from "react";
import SchedulePageLoading from "./home/ui/loading";
import { getSchedules } from "./home/actions/get-schedules";
import SchedulesInfiniteClient from "./home/ui/SchedulesInfiniteClient";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      <Suspense fallback={<SchedulePageLoading isPage />}>
        <ScheduleDataFetcher searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function ScheduleDataFetcher({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const initialData = await getSchedules({
    searchQuery: searchParams.search,
    page: 1,
    pageSize: 20,
  });

  return <SchedulesInfiniteClient initialData={initialData} />;
}
