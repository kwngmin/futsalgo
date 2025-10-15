import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";

const OnboardingComplete = () => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="w-6 h-6 text-green-600" />
        </div>
        <CardTitle>온보딩 완료!</CardTitle>
        <CardDescription>
          {countdown > 0 ? (
            <span className="font-semibold text-blue-600">
              {countdown}초 후 경기일정으로 이동합니다...
            </span>
          ) : (
            "경기일정으로 이동 중..."
          )}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default OnboardingComplete;
