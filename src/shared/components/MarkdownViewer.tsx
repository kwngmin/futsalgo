// shared/components/MarkdownViewer.tsx
import { memo } from "react";
import ReactMarkdown from "react-markdown";

type MarkdownViewProps = {
  content: string;
};

// 메모이제이션으로 불필요한 리렌더링 방지
const MarkdownView = memo(({ content }: MarkdownViewProps) => {
  // Markdown 라이브러리 사용 시 최적화된 파서 사용
  // 예: react-markdown 대신 marked 또는 remark 직접 사용
  return (
    <ReactMarkdown
      rehypePlugins={
        [
          //   rehypeRaw,
          //   rehypeSanitize,
          //   [rehypeHighlight, { ignoreMissing: true }],
        ]
      }
      components={{
        // 필요에 따라 요소 커스터마이징
        a: ({ ...props }) => (
          <a {...props} target="_blank" rel="noopener noreferrer" />
        ),
        // 다른 요소 커스터마이징도 가능
      }}
    >
      {content}
    </ReactMarkdown>
  );
});

MarkdownView.displayName = "MarkdownView";

export default MarkdownView;
