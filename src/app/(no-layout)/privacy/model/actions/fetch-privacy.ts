"use server";

import getJsonFile from "@/shared/lib/file/get-json-file";
import getMdFile from "@/shared/lib/file/get-md-file";
import { cache } from "react";

type PrivacyItem = {
  id: string;
  fileName: string;
  date: string;
};

export const fetchPrivacy = cache(async () => {
  const list = (await getJsonFile("privacy")).sort(
    (a: PrivacyItem, b: PrivacyItem) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const content = await getMdFile({
    fileName: list[0].fileName,
    type: "privacy",
  });

  return {
    list,
    content,
  };
});
