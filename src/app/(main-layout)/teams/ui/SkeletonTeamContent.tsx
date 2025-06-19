import SkeletonTeamCard from "./SkeletonTeamCard";

const SkeletonTeamContent = () => {
  return (
    <div className="px-3 space-y-4">
      <SkeletonTeamCard nickName="w-32" teamName="w-24" />
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex gap-1 bg-gray-100 rounded-full p-1 w-64">
            <div className="h-4 w-16 rounded-full bg-slate-200 animate-pulse" />
          </div>
          <div className="animate-pulse rounded-full shrink-0 w-9 h-4 bg-gray-200 mr-4" />
        </div>
        <SkeletonTeamCard nickName="w-12" teamName="w-40" />
        <SkeletonTeamCard />
        <SkeletonTeamCard nickName="w-36" teamName="w-12" />
        <SkeletonTeamCard />
        <SkeletonTeamCard nickName="w-28" teamName="w-20" />
        <SkeletonTeamCard nickName="w-40" teamName="w-32" />
        <SkeletonTeamCard />
      </div>
    </div>
  );
};

export default SkeletonTeamContent;
