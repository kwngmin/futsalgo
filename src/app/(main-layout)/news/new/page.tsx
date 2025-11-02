import { auth } from "@/shared/lib/auth";
import { redirect } from "next/navigation";
import NewNewsForm from "./ui/NewNewsForm";
import { X } from "lucide-react";
import Link from "next/link";

/**
 * 새로운 대회 소식 작성 페이지
 */
const NewNewsPage = async () => {
  const session = await auth();

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0 border-b">
        <h1 className="text-[1.625rem] font-bold">새로운 대회 소식</h1>
        <Link
          href="/news"
          className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="size-6" />
        </Link>
      </div>

      {/* 폼 */}
      <div className="mt-4">
        <NewNewsForm />
      </div>
    </div>
  );
};

export default NewNewsPage;

