// app/privacy/page.tsx
import { fetchInitialPrivacy } from "./model/actions/fetch-privacy";
import PrivacySelector from "./ui/PrivacySelector";

const PrivacyPage = async () => {
  const { list, content } = await fetchInitialPrivacy();

  return <PrivacySelector initialList={list} initialContent={content} />;
};

export default PrivacyPage;
