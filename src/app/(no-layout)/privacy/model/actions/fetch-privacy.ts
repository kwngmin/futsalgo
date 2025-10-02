// model/actions/fetch-privacy.ts
"use server";

import getJsonFile from "@/shared/lib/file/get-json-file";
import getMdFile from "@/shared/lib/file/get-md-file";
import { cache } from "react";

type PrivacyItem = {
  id: string;
  fileName: string;
  date: string;
};

type PrivacyData = {
  list: PrivacyItem[];
  content: string;
};

export const fetchPrivacy = cache(async (): Promise<PrivacyData> => {
  // 병렬 처리: JSON 파일 읽기와 파싱을 동시에 시작
  const [list] = await Promise.all([getJsonFile<PrivacyItem[]>("privacy")]);

  // 정렬 후 첫 번째 항목의 파일명 추출
  const sortedList = list.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // MD 파일은 필요한 파일명을 알아낸 후에만 읽기
  const content = await getMdFile({
    fileName: sortedList[0].fileName,
    type: "privacy",
  });

  return {
    list: sortedList,
    content,
  };
});
