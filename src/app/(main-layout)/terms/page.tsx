import { fetchInitialTerms } from "./model/actions/fetch-terms";
import TermsSelector from "./ui/TermsSelector";

const TermsPage = async () => {
  const { list, content } = await fetchInitialTerms();

  return <TermsSelector initialList={list} initialContent={content} />;
};

export default TermsPage;
