import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Check } from "lucide-react";

const OnboardingComplete = () => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="w-6 h-6 text-green-600" />
        </div>
        <CardTitle>온보딩 완료!</CardTitle>
        <CardDescription>잠시 후 대시보드로 이동합니다...</CardDescription>
      </CardHeader>
    </Card>
  );
};

export default OnboardingComplete;
