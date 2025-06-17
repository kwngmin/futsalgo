import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { Angry, Frown, Laugh, Meh, Skull, Smile } from "lucide-react";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";

const MannerBar = ({ score }: { score: number }) => {
  const transformScore = (score: number) => {
    if (score >= 90)
      return {
        icon: <Laugh className="size-5" color="darkblue" />,
        color: "blue",
        text: "최고",
      };
    if (score >= 70)
      return {
        icon: <Smile className="size-5" color="darkgreen" strokeWidth={2} />,
        color: "green",
        text: "좋음",
      };
    if (score >= 50)
      return {
        icon: <Meh className="size-5" color="#b78700" strokeWidth={2} />,
        color: "yellow",
        text: "양호",
      };
    if (score >= 30)
      return {
        icon: <Frown className="size-5" color="#c25000" strokeWidth={2} />,
        color: "orange",
        text: "주의",
      };
    if (score >= 10)
      return {
        icon: <Angry className="size-5" color="darkred" strokeWidth={2} />,
        color: "red",
        text: "위험",
      };
    return {
      icon: <Skull className="size-5" color="gray" strokeWidth={2} />,
      color: "black",
      text: "최악",
    };
  };

  const { icon, color, text } = transformScore(score);

  const transformColor = (color: string) => {
    switch (color) {
      case "blue":
        return {
          bgColor: "bg-blue-600",
          textColor: "text-blue-700",
        };
      case "green":
        return {
          bgColor: "bg-green-600",
          textColor: "text-green-700",
        };
      case "yellow":
        return {
          bgColor: "bg-yellow-600",
          textColor: "text-yellow-700",
        };
      case "orange":
        return {
          bgColor: "bg-orange-600",
          textColor: "text-orange-700",
        };
      case "red":
        return {
          bgColor: "bg-red-600",
          textColor: "text-red-700",
        };
      default:
        return {
          bgColor: "bg-gray-700",
          textColor: "text-black",
        };
    }
  };

  const { bgColor, textColor } = transformColor(color);

  return (
    <div className="flex flex-col justify-end px-3 h-16 space-y-3">
      <div className="flex justify-between px-2">
        <Tooltip>
          <TooltipTrigger className="flex items-center gap-1">
            <Label className="font-semibold">
              {/* <Label className="font-semibold underline underline-offset-4"> */}
              매너 점수
            </Label>
            {/* <Info className="size-4" /> */}
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm font-medium">
              매너 온도는 플레이어의 매너 점수를 나타냅니다.
            </p>
          </TooltipContent>
        </Tooltip>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {icon}
            <span className={cn("text-sm font-bold", textColor)}>{text}</span>
          </div>
          <div
            className={cn(
              "flex items-center gap-0.5 px-2 py-0.5 rounded font-semibold text-sm text-white leading-none h-6",
              bgColor
            )}
          >
            {score}
            <span className="text-xs font-medium">점</span>
          </div>
        </div>
      </div>
      <div className="bg-gray-400 rounded-t-full h-1 w-full flex overflow-hidden">
        <div className="bg-black h-2 w-1/10" />
        <div className="bg-red-500 h-2 w-1/4" />
        <div className="bg-orange-500 h-2 w-1/4" />
        <div className="bg-yellow-500 h-2 w-1/4" />
        <div className="bg-green-500 h-2 w-1/4" />
        <div className="bg-blue-500 h-2 w-1/10" />
      </div>
    </div>
  );
};

export default MannerBar;
