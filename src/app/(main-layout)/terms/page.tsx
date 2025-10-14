import type { Metadata } from "next";
import { fetchInitialTerms } from "./model/actions/fetch-terms";
import TermsSelector from "./ui/TermsSelector";

export const metadata: Metadata = {
  title: "이용약관",
  description:
    "Futsalgo 서비스 이용약관을 확인하세요. 서비스 이용에 관한 모든 규정과 조건을 자세히 안내합니다.",
  keywords: [
    "풋살 이용약관",
    "풋살 서비스 약관",
    "풋살 이용 규정",
    "풋살 서비스 조건",
  ],
  openGraph: {
    title: "Futsalgo 이용약관",
    description:
      "Futsalgo 서비스 이용약관을 확인하세요. 서비스 이용에 관한 모든 규정과 조건을 자세히 안내합니다.",
    url: "https://futsalgo.com/terms",
  },
  twitter: {
    title: "Futsalgo 이용약관",
    description:
      "Futsalgo 서비스 이용약관을 확인하세요. 서비스 이용에 관한 모든 규정과 조건을 자세히 안내합니다.",
  },
};

const TermsPage = async () => {
  const { list, content } = await fetchInitialTerms();

  return <TermsSelector initialList={list} initialContent={content} />;
};

export default TermsPage;
