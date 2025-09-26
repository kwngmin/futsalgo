import SkeletonTeamContent from "../ui/SkeletonTeamContent";

const FollowingTeamsPageLoading = () => {
  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      <div className="flex items-center justify-between px-4 h-16 shrink-0">
        <div className="flex gap-3">
          <h1 className="text-[1.625rem] font-bold cursor-default opacity-30">
            팀
          </h1>
          <h1 className="text-[1.625rem] font-bold cursor-default">팔로잉</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="shrink-0 size-10 flex items-center justify-center bg-gray-100 rounded-full animate-pulse" />
        </div>
      </div>
      <SkeletonTeamContent />
    </div>
  );
};

export default FollowingTeamsPageLoading;
