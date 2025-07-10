import SkeletonPlayCard from "./SkeletonPlayerCard";

const SkeletonPlayerContent = () => {
  return (
    <div className="flex flex-col">
      <SkeletonPlayCard nickName="w-32" teamName="w-24" />
      <SkeletonPlayCard nickName="w-12" teamName="w-40" />
      <SkeletonPlayCard />
      <SkeletonPlayCard nickName="w-36" teamName="w-12" />
      <SkeletonPlayCard />
      <SkeletonPlayCard nickName="w-28" teamName="w-20" />
      <SkeletonPlayCard nickName="w-40" teamName="w-32" />
      <SkeletonPlayCard />
    </div>
  );
};

export default SkeletonPlayerContent;
