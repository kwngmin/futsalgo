import SkeletonTeamCard from "./SkeletonTeamCard";

const SkeletonTeamContent = () => {
  return (
    <div className="flex flex-col bg-white rounded-2xl mx-3">
      <SkeletonTeamCard teamName="w-36" description="w-42" />
      <SkeletonTeamCard />
      <SkeletonTeamCard teamName="w-32" description="w-56" />
      <SkeletonTeamCard />
      <SkeletonTeamCard teamName="w-40" description="w-48" />
      <SkeletonTeamCard teamName="w-36" description="w-40" />
      <SkeletonTeamCard teamName="w-28" description="w-48" />
    </div>
  );
};

export default SkeletonTeamContent;
