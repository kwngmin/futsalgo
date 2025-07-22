const LikedPageLoading = () => {
  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      <div className="flex items-center justify-between px-4 h-16 shrink-0">
        <div className="flex gap-3">
          <h1 className="text-2xl font-bold opacity-30 cursor-default">
            경기일정
          </h1>
          <h1 className="text-2xl font-bold cursor-default">좋아요</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="shrink-0 size-10 flex items-center justify-center bg-gray-100 rounded-full animate-pulse" />
          <button className="shrink-0 size-10 flex items-center justify-center bg-gray-100 rounded-full animate-pulse" />
        </div>
      </div>
      <div className="px-4">
        {Array.from({ length: 10 }).map((_, index) => {
          return (
            <div
              key={index}
              className="flex flex-col gap-2 h-14 justify-center"
            >
              <div className="flex items-center gap-2">
                <div className="grow flex flex-col gap-2">
                  <div className="w-64 h-4 bg-gray-100 rounded animate-pulse" />
                  <div className="w-36 h-5 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="size-10 flex items-center justify-center">
                  <div className="size-6 bg-gray-100 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LikedPageLoading;
