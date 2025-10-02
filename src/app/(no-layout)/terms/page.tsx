import MarkdownView from "@/shared/components/MarkdownViewer";
import { fetchTerms } from "./model/actions/fetch-terms";

const TermsPage = async () => {
  const { list, content } = await fetchTerms();

  console.log(list, content);

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      PrivacyPage
      <MarkdownView content={content} />
    </div>
  );
};

export default TermsPage;
