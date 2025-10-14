import type { Metadata } from "next";
import { fetchInitialPrivacy } from "./model/actions/fetch-privacy";
import PrivacySelector from "./ui/PrivacySelector";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description:
    "Futsalgo 개인정보처리방침을 확인하세요. 개인정보 수집, 이용, 보관에 관한 모든 정책을 자세히 안내합니다.",
  keywords: [
    "풋살 개인정보처리방침",
    "풋살 개인정보 보호",
    "풋살 개인정보 정책",
    "풋살 개인정보 수집",
  ],
  openGraph: {
    title: "Futsalgo 개인정보처리방침",
    description:
      "Futsalgo 개인정보처리방침을 확인하세요. 개인정보 수집, 이용, 보관에 관한 모든 정책을 자세히 안내합니다.",
    url: "https://futsalgo.com/privacy",
  },
  twitter: {
    title: "Futsalgo 개인정보처리방침",
    description:
      "Futsalgo 개인정보처리방침을 확인하세요. 개인정보 수집, 이용, 보관에 관한 모든 정책을 자세히 안내합니다.",
  },
};

const PrivacyPage = async () => {
  const { list, content } = await fetchInitialPrivacy();

  return <PrivacySelector initialList={list} initialContent={content} />;
};

export default PrivacyPage;
