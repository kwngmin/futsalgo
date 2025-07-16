import {
  Angry,
  ChevronRight,
  Frown,
  // Gauge,
  Gem,
  Laugh,
  Meh,
  Skull,
  Smile,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

const MannerBar = ({ score = 60 }: { score?: number }) => {
  const transformScore = (score: number) => {
    if (score >= 90)
      return {
        icon: <Laugh className="size-4 stroke-blue-700" />,
        color: "blue",
        text: "최고",
      };
    if (score >= 70)
      return {
        icon: <Smile className="size-4 stroke-green-700" strokeWidth={2} />,
        color: "green",
        text: "좋음",
      };
    if (score >= 50)
      return {
        icon: <Meh className="size-4 stroke-yellow-700" strokeWidth={2} />,
        color: "yellow",
        text: "양호",
      };
    if (score >= 30)
      return {
        icon: <Frown className="size-4 stroke-orange-700" strokeWidth={2} />,
        color: "orange",
        text: "주의",
      };
    if (score >= 10)
      return {
        icon: <Angry className="size-4 stroke-red-700" strokeWidth={2} />,
        color: "red",
        text: "위험",
      };
    return {
      icon: <Skull className="size-4 stroke-gray-700" strokeWidth={2} />,
      color: "black",
      text: "최악",
    };
  };

  const { icon, color, text } = transformScore(score);

  const transformColor = (color: string) => {
    switch (color) {
      case "blue":
        return {
          bgColor: "bg-blue-600/10",
          textColor: "text-blue-700",
        };
      case "green":
        return {
          bgColor: "bg-green-600/10",
          textColor: "text-green-700",
        };
      case "yellow":
        return {
          bgColor: "bg-yellow-600/10",
          textColor: "text-yellow-700",
        };
      case "orange":
        return {
          bgColor: "bg-orange-600/10",
          textColor: "text-orange-700",
        };
      case "red":
        return {
          bgColor: "bg-red-600/10",
          textColor: "text-red-700",
        };
      default:
        return {
          bgColor: "bg-gray-700/10",
          textColor: "text-black",
        };
    }
  };

  const { bgColor, textColor } = transformColor(color);

  return (
    <div
      className="w-full shadow-xs flex items-center justify-between px-4 gap-3 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors border rounded-lg h-12"
      onClick={() => {
        alert("페어플레이 점수");
      }}
    >
      <div className="flex items-center space-x-3">
        <Gem className="size-5 text-gray-600" />
        {/* <Gauge className="size-5 text-gray-600" /> */}
        <span className="font-medium">페어플레이</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {icon}
            <span className={cn("text-sm font-semibold", textColor)}>
              {text}
            </span>
          </div>
          <div
            className={cn(
              "flex items-center gap-0.5 px-2 py-0.5 rounded font-semibold text-sm text-white leading-none h-7",
              bgColor,
              textColor
            )}
          >
            {score}
            <span className="text-xs font-medium">점</span>
          </div>
        </div>
        <ChevronRight className="size-5 text-gray-400" />
      </div>
    </div>
    // <div className="flex justify-between items-center h-12 px-4 space-y-4 rounded-lg overflow-hidden border">
    //   <Tooltip>
    //     <TooltipTrigger className="flex items-center gap-1 my-auto">
    //       <Label className="font-medium text-base flex items-center space-x-3">
    //         <Gem className="size-5 text-gray-600" />
    //         매너 점수
    //       </Label>
    //       <Info className="size-4" />
    //     </TooltipTrigger>
    //     <TooltipContent>
    //       <p className="text-sm font-medium">
    //         매너 온도는 플레이어의 매너 점수를 나타냅니다.
    //       </p>
    //     </TooltipContent>
    //   </Tooltip>
    //   <div className="flex items-center gap-2">
    //     <div className="flex items-center gap-1">
    //       {icon}
    //       <span className={cn("text-sm font-semibold", textColor)}>{text}</span>
    //     </div>
    //     <div
    //       className={cn(
    //         "flex items-center gap-0.5 px-2 py-0.5 rounded font-semibold text-sm text-white leading-none h-6",
    //         bgColor,
    //         textColor
    //       )}
    //     >
    //       {score}
    //       <span className="text-xs font-medium">점</span>
    //     </div>
    //   </div>

    // </div>
  );
};

export default MannerBar;
