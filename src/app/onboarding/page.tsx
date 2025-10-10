import { auth } from "@/shared/lib/auth";
import { redirect } from "next/navigation";
import { OnboardingFlow } from "./ui/OnboardingFlow";

const OnboardingPage = async () => {
  const session = await auth();
  console.log(session, "session");

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-sm space-y-8 mb-32">
        <div className="text-center">
          <h1 className="text-[1.625rem] font-bold text-gray-900">
            환영합니다!
          </h1>
          {/* <p className="mt-2 text-sm text-gray-600">
            서비스 이용을 위해 닉네임을 설정해주세요
          </p> */}
        </div>
        <OnboardingFlow />
      </div>
    </div>
  );
};

export default OnboardingPage;
