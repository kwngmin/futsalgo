const SchedulePageLoading = ({
  isPage = false,
  isMySchedules = false,
}: {
  isPage?: boolean;
  isMySchedules?: boolean;
}) => {
  if (isPage) {
    return (
      <div className="max-w-2xl mx-auto pb-16 flex flex-col w-full">
        <div className="flex items-center justify-between px-4 h-16 shrink-0">
          <div className="flex gap-3">
            <h1
              className={`text-[1.625rem] font-bold cursor-default ${
                isMySchedules ? "opacity-30" : ""
              }`}
            >
              경기 일정
            </h1>
            <h1
              className={`text-[1.625rem] font-bold cursor-default ${
                isMySchedules ? "" : "opacity-30"
              }`}
            >
              내 일정
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="shrink-0 size-10 flex items-center justify-center bg-gray-100 rounded-full animate-pulse" />
            {/* <button className="shrink-0 size-10 flex items-center justify-center bg-gray-100 rounded-full animate-pulse" />
            <button className="shrink-0 size-10 flex items-center justify-center bg-gray-100 rounded-full animate-pulse" /> */}
          </div>
        </div>
        <div className="px-4">
          {Array.from({ length: 10 }).map((_, index) => {
            return (
              <div key={index} className="flex items-center gap-3 py-2">
                <div className="size-14 rounded-2xl bg-gray-100 animate-pulse shrink-0" />
                <div className="grow flex flex-col gap-2">
                  <div className="w-48 h-4 bg-gray-100 rounded animate-pulse" />
                  <div className="w-32 h-5 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="size-10 flex items-center justify-center">
                  <div className="size-6 bg-gray-100 rounded-full animate-pulse" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-16 px-4">
      {Array.from({ length: 10 }).map((_, index) => {
        return (
          <div key={index} className="flex items-center gap-3 py-2">
            <div className="size-14 rounded-2xl bg-gray-100 animate-pulse shrink-0" />
            <div className="grow flex flex-col gap-2">
              <div className="w-48 h-4 bg-gray-100 rounded animate-pulse" />
              <div className="w-32 h-5 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="size-10 flex items-center justify-center">
              <div className="size-6 bg-gray-100 rounded-full animate-pulse" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SchedulePageLoading;
