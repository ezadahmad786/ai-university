import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Code blocks with syntax highlighting
          code({ node, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            if (language) {
              return (
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={language}
                  PreTag="div"
                  className="code-block"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              );
            }
            
            // Inline code
            return (
              <code className="inline-code" {...props}>
                {children}
              </code>
            );
          },
          
          // Bold text
          strong({ children }: any) {
            return <strong className="font-bold">{children}</strong>;
          },
          
          // Italic text
          em({ children }: any) {
            return <em className="italic">{children}</em>;
          },
          
          // Headings
          h1({ children }: any) {
            return <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>;
          },
          
          h2({ children }: any) {
            return <h2 className="text-xl font-bold mb-3 mt-5">{children}</h2>;
          },
          
          h3({ children }: any) {
            return <h3 className="text-lg font-semibold mb-2 mt-4">{children}</h3>;
          },
          
          // Paragraphs
          p({ children }: any) {
            return <p className="mb-4 leading-relaxed">{children}</p>;
          },
          
          // Unordered lists
          ul({ children }: any) {
            return <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>;
          },
          
          // Ordered lists
          ol({ children }: any) {
            return <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>;
          },
          
          // List items
          li({ children }: any) {
            return <li className="leading-relaxed">{children}</li>;
          },
          
          // Blockquotes
          blockquote({ children }: any) {
            return (
              <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-blue-50 rounded-r">
                {children}
              </blockquote>
            );
          },
          
          // Links
          a({ children, href }: any) {
            return (
              <a 
                href={href} 
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },
          
          // Horizontal rule
          hr() {
            return <hr className="my-6 border-gray-300" />;
          },
          
          // Tables
          table({ children }: any) {
            return (
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full border-collapse border border-gray-300">
                  {children}
                </table>
              </div>
            );
          },
          
          thead({ children }: any) {
            return <thead className="bg-gray-100">{children}</thead>;
          },
          
          tbody({ children }: any) {
            return <tbody>{children}</tbody>;
          },
          
          tr({ children }: any) {
            return <tr className="border-b border-gray-300">{children}</tr>;
          },
          
          th({ children }: any) {
            return <th className="border border-gray-300 px-4 py-2 text-left font-semibold">{children}</th>;
          },
          
          td({ children }: any) {
            return <td className="border border-gray-300 px-4 py-2">{children}</td>;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
