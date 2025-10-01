"use client";

import { Suspense } from "react";
import SchedulePageLoading from "./home/ui/loading";
import SchedulesContainer from "./home/ui/SchedulesContainer";

/**
 * 홈 페이지 - 데이터 페칭과 렌더링을 분리하여 즉시 로딩 UI 표시
 */
const HomePage = () => {
  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      <Suspense fallback={<SchedulePageLoading isPage />}>
        <SchedulesContainer />
      </Suspense>
    </div>
  );
};

export default HomePage;
