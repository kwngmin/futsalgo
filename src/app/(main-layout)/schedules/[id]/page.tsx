import type { Metadata } from "next";
import { auth } from "@/shared/lib/auth";
import ScheduleContent from "./ui/ScheduleContent";
// import { prisma } from "@/shared/lib/prisma";

/**
 * 일정 페이지 메타데이터 생성
 * @param params - URL 파라미터
 * @returns 메타데이터 객체
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  return {
    title: "경기 일정 상세",
    description: `풋살 일정을 확인하고 참석 신청하세요. 경기 정보, 참석자, MVP 투표, 사진 공유 등 다양한 기능을 이용할 수 있습니다.`,
    keywords: [
      "풋살 일정",
      "풋살 경기",
      "풋살 매칭",
      "풋살 참석",
      "풋살 MVP",
      "풋살 사진",
    ],
    openGraph: {
      title: "Futsalgo 풋살 일정",
      description: `풋살 일정을 확인하고 참석 신청하세요. 경기 정보, 참석자, MVP 투표, 사진 공유 등 다양한 기능을 이용할 수 있습니다.`,
      url: `https://futsalgo.com/schedules/${id}`,
    },
    twitter: {
      title: "Futsalgo 풋살 일정",
      description: `풋살 일정을 확인하고 참석 신청하세요. 경기 정보, 참석자, MVP 투표, 사진 공유 등 다양한 기능을 이용할 수 있습니다.`,
    },
  };
}

const SchedulePage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user.id;

  console.log(session, "session");

  // const schedule = await prisma.schedule.findUnique({
  //   where: {
  //     id,
  //   },
  //   select: {
  //     startTime: true,
  //     matchType: true,
  //   },
  // });

  if (userId) {
    // 이미 좋아요 되어있는지 확인
    // const isLiked = await prisma.scheduleLike.findUnique({
    //   where: {
    //     scheduleId_userId: {
    //       scheduleId: id,
    //       userId,
    //     },
    //   },
    // });
    return (
      <ScheduleContent
        scheduleId={id}
        // isLikedSchedule={Boolean(isLiked)}
        // startTime={schedule?.startTime}
        // matchType={schedule?.matchType}
      />
    );
  }
  return (
    <ScheduleContent
      scheduleId={id}
      // startTime={schedule?.startTime}
      // matchType={schedule?.matchType}
    />
  );
};

export default SchedulePage;
