"use server";

import getJsonFile from "@/shared/lib/file/get-json-file";
import getMdFile from "@/shared/lib/file/get-md-file";
import { cache } from "react";

type TermsItem = {
  id: string;
  fileName: string;
  date: string;
};

type TermsData = {
  list: TermsItem[];
  content: string;
};

export const fetchTerms = cache(async (): Promise<TermsData> => {
  const [list] = await Promise.all([getJsonFile<TermsItem[]>("terms")]);

  // 정렬 후 첫 번째 항목의 파일명 추출
  const sortedList = list.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // MD 파일은 필요한 파일명을 알아낸 후에만 읽기
  const content = await getMdFile({
    fileName: sortedList[0].fileName,
    type: "terms",
  });

  return {
    list: sortedList,
    content,
  };
});
