"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
// import rehypeRaw from "rehype-raw";
// import rehypeSanitize from "rehype-sanitize";
// import rehypeHighlight from "rehype-highlight";
// import "highlight.js/styles/github-dark.css";

interface MarkdownViewProps {
  content: string;
  className?: string;
}

/**
 * 마크다운 콘텐츠를 렌더링하는 컴포넌트
 * @param content 마크다운 문자열
 * @param className 추가 CSS 클래스
 * @returns 렌더링된 마크다운 컴포넌트
 */
const MarkdownView = ({ content, className = "" }: MarkdownViewProps) => {
  return (
    <div
      className={`prose prose-lg dark:prose-invert max-w-none w-full h-full ${className}`}
    >
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
    </div>
  );
};

export default MarkdownView;
