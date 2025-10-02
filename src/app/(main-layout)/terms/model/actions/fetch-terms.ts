"use server";

import { readFile } from "fs/promises";
import path from "path";
import { cache } from "react";

export type TermsItem = {
  id: string;
  fileName: string;
  date: string;
};

type TermsData = {
  list: TermsItem[];
  content: string;
};

// 리스트만 가져오는 함수 (캐싱)
export const fetchTermsList = cache(async (): Promise<TermsItem[]> => {
  const jsonPath = path.join(process.cwd(), "data/legal", "terms.json");
  const jsonContent = await readFile(jsonPath, "utf-8");
  const list = JSON.parse(jsonContent) as TermsItem[];

  return list.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
});

// 특정 파일의 콘텐츠만 가져오는 함수 (캐싱)
export const fetchTermsContent = cache(
  async (fileName: string): Promise<string> => {
    try {
      const mdPath = path.join(
        process.cwd(),
        "data/legal",
        "terms",
        `${fileName}.md`
      );
      return await readFile(mdPath, "utf-8");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to load terms/${fileName}.md: ${errorMessage}`);
    }
  }
);

// 초기 데이터 로딩 (리스트 + 첫 번째 콘텐츠)
export const fetchInitialTerms = cache(async (): Promise<TermsData> => {
  const list = await fetchTermsList();
  const content = await fetchTermsContent(list[0].fileName);

  return { list, content };
});
