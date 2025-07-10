import { cn } from "@/shared/lib/utils";

const SkeletonTeamCard = ({
  teamName,
  description,
}: {
  teamName?: string;
  description?: string;
}) => {
  return (
    <div className="px-4 py-2 border-t border-gray-100 first:border-t-0">
      <div className="flex gap-3">
        <div className="size-14 bg-gray-200 rounded-lg animate-pulse" />
        <div className="flex-1 flex flex-col justify-center space-y-3">
          <div
            className={cn(
              "h-4 bg-gray-200 rounded w-16 animate-pulse",
              teamName
            )}
          />
          <div
            className={cn(
              "h-3 bg-gray-200 rounded w-24 animate-pulse",
              description
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

export default SkeletonTeamCard;
