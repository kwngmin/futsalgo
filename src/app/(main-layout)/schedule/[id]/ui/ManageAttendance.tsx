import { ChevronRight } from "lucide-react";
import Image from "next/image";

const ManageAttendance = ({
  logoUrl,
  name,
  isManageableTeam,
  onClick,
}: {
  logoUrl: string;
  name: string;
  isManageableTeam?: boolean;
  onClick?: () => void;
}) => {
  return (
    <div
      className="rounded-md px-3 w-full flex items-center justify-between h-12 sm:h-11 gap-3 cursor-pointer bg-gray-50 hover:bg-gray-100 border transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt="team_logo"
            width={24}
            height={24}
            className="rounded-lg"
          />
        ) : (
          <div className="size-6 rounded-lg bg-gray-200" />
        )}
        <span className="text-base font-medium">{name}</span>
      </div>
      {isManageableTeam && (
        <div className="flex items-center gap-1">
          <span className="text-base font-medium text-gray-500">수정</span>
          <ChevronRight className="size-5 text-gray-400" />
        </div>
      )}
    </div>
  );
};

export default ManageAttendance;
