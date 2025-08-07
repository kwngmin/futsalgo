"use client";

import { useSession } from "next-auth/react";
import SchedulePhoto from "./SchedulePhoto";
import SchedulePhotosGallery from "./SchedulePhotosGallery";
// import { keepPreviousData, useQuery } from "@tanstack/react-query";

const SchedulePhotos = ({ scheduleId }: { scheduleId: string }) => {
  console.log(scheduleId);
  const session = useSession();
  const sessionUser = session.data?.user;
  console.log(sessionUser);

  //   const { data, isLoading, error } = useQuery({
  //     queryKey: ["schedule-photos", scheduleId],
  //     queryFn: () => getSchedulePhotos(scheduleId),
  //     placeholderData: keepPreviousData,
  //   });

  return (
    <div className="mt-4 px-4">
      {sessionUser?.id && <SchedulePhoto scheduleId={scheduleId} />}
      <SchedulePhotosGallery scheduleId={scheduleId} />
    </div>
  );
};

export default SchedulePhotos;
