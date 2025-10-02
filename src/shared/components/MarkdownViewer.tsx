// shared/components/MarkdownViewer.tsx
import { memo } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

type MarkdownViewProps = {
  content: string;
};

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl font-bold mt-6 mb-3">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-bold mt-5 mb-2">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-lg font-semibold mt-4 mb-2">{children}</h4>
  ),
  h5: ({ children }) => (
    <h5 className="text-base font-semibold mt-3 mb-2">{children}</h5>
  ),
  h6: ({ children }) => (
    <h6 className="text-sm font-semibold mt-3 mb-2">{children}</h6>
  ),
  p: ({ children }) => <p className="mb-4 leading-7">{children}</p>,
  ul: ({ children }) => (
    <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-7">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">
      {children}
    </blockquote>
  ),
  code: ({ className, children }) => {
    const isInline = !className;
    return isInline ? (
      <code className="bg-gray-100 rounded px-1.5 py-0.5 text-sm font-mono">
        {children}
      </code>
    ) : (
      <code
        className={`${className} block bg-gray-100 rounded p-4 overflow-x-auto text-sm font-mono`}
      >
        {children}
      </code>
    );
  },
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 underline"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-8 border-t border-gray-300" />,
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border-collapse border border-gray-300">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-gray-100">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-gray-300">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-gray-300 px-4 py-2">{children}</td>
  ),
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
      // components={{
      //   a: ({ ...props }) => (
      //     <a {...props} target="_blank" rel="noopener noreferrer" />
      //   ),
      // }}
      components={markdownComponents}
    >
      {content}
    </ReactMarkdown>
  );
});

MarkdownView.displayName = "MarkdownView";

export default MarkdownView;
