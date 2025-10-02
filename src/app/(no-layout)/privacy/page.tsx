import MarkdownView from "@/shared/components/MarkdownViewer";
import { fetchPrivacy } from "./model/actions/fetch-privacy";

const PrivacyPage = async () => {
  const { list, content } = await fetchPrivacy();

  console.log(list, content);

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      PrivacyPage
      <MarkdownView content={content} />
    </div>
  );
};

export default PrivacyPage;
