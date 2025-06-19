import { cn } from "@/shared/lib/utils";

const SkeletonPlayerCard = ({
  nickName,
  teamName,
}: {
  nickName?: string;
  teamName?: string;
}) => {
  return (
    <div className="bg-white rounded-2xl p-3">
      <div className="flex gap-3">
        <div className="size-12 bg-gray-200 rounded-full animate-pulse" />
        <div className="flex-1 flex flex-col justify-center space-y-3">
          <div
            className={cn(
              "h-4 bg-gray-200 rounded w-16 animate-pulse",
              nickName
            )}
          />
          <div
            className={cn(
              "h-3 bg-gray-200 rounded w-24 animate-pulse",
              teamName
            )}
          />
        </div>
        {/* <div className="w-12 flex flex-col justify-center items-center text-right space-y-3">
          <div className="h-3 bg-gray-200 rounded w-10 animate-pulse" />
          <div className="h-5 bg-gray-200 rounded w-8 animate-pulse" />
        </div> */}
      </div>
    </div>
  );
};

export default SkeletonPlayerCard;
