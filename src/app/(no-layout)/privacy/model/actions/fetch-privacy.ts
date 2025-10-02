// model/actions/fetch-privacy.ts
"use server";

import { readFile } from "fs/promises";
import path from "path";
import { cache } from "react";

export type PrivacyItem = {
  id: string;
  fileName: string;
  date: string;
};

type PrivacyData = {
  list: PrivacyItem[];
  content: string;
};

// 리스트만 가져오는 함수 (캐싱)
export const fetchPrivacyList = cache(async (): Promise<PrivacyItem[]> => {
  const jsonPath = path.join(process.cwd(), "data/legal", "privacy.json");
  const jsonContent = await readFile(jsonPath, "utf-8");
  const list = JSON.parse(jsonContent) as PrivacyItem[];

  return list.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
});

// 특정 파일의 콘텐츠만 가져오는 함수 (캐싱)
export const fetchPrivacyContent = cache(
  async (fileName: string): Promise<string> => {
    try {
      const mdPath = path.join(
        process.cwd(),
        "data/legal",
        "privacy",
        `${fileName}.md`
      );
      return await readFile(mdPath, "utf-8");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to load privacy/${fileName}.md: ${errorMessage}`);
    }
  }
);

// 초기 데이터 로딩 (리스트 + 첫 번째 콘텐츠)
export const fetchInitialPrivacy = cache(async (): Promise<PrivacyData> => {
  const list = await fetchPrivacyList();
  const content = await fetchPrivacyContent(list[0].fileName);

  return { list, content };
});
