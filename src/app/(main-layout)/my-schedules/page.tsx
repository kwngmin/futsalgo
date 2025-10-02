// import { Suspense } from "react";
// import SchedulePageLoading from "../home/ui/loading";
import { getMySchedules } from "./actions/get-my-schedules";
import MySchedulesInfiniteClient from "./ui/MySchedulesInfiniteClient";

/**
 * 내 일정 페이지 - Server Component
 * Next.js 15: searchParams는 Promise
 */
export default async function MySchedulesPage() {
  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* <Suspense fallback={<SchedulePageLoading isPage isMySchedules />}> */}
      <MySchedulesDataFetcher />
      {/* </Suspense> */}
    </div>
  );
}

/**
 * 초기 데이터 페칭 - Server Component
 */
async function MySchedulesDataFetcher() {
  const initialData = await getMySchedules({
    page: 1,
    pageSize: 20,
  });

  return <MySchedulesInfiniteClient initialData={initialData} />;
}
