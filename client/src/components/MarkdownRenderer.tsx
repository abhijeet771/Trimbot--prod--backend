import React from 'react';

interface IMarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<IMarkdownRendererProps> = ({ content }) => {
  // Simple regex parser to parse basic markdown (**bold**, *italics*, lists, newlines)
  const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      // 1. Check for bullet list item
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const itemText = line.trim().substring(2);
        return (
          <li key={index} className="ml-4 list-disc text-zinc-300 leading-relaxed mb-1"
              dangerouslySetInnerHTML={{ __html: formatInlineStyles(itemText) }} />
        );
      }

      // 2. Check for numbered list item
      const numMatch = line.trim().match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        const itemText = numMatch[2];
        return (
          <li key={index} className="ml-4 list-decimal text-zinc-300 leading-relaxed mb-1"
              dangerouslySetInnerHTML={{ __html: formatInlineStyles(itemText) }} />
        );
      }

      // 3. Check for headings
      if (line.startsWith('### ')) {
        return (
          <h4 key={index} className="text-sm font-semibold text-amber-500 mt-3 mb-1"
              dangerouslySetInnerHTML={{ __html: formatInlineStyles(line.substring(4)) }} />
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={index} className="text-base font-bold text-amber-500 mt-4 mb-2"
              dangerouslySetInnerHTML={{ __html: formatInlineStyles(line.substring(3)) }} />
        );
      }

      // 4. Standard paragraph
      if (line.trim() === '') {
        return <div key={index} className="h-2" />;
      }

      return (
        <p key={index} className="text-zinc-200 leading-relaxed mb-1.5"
           dangerouslySetInnerHTML={{ __html: formatInlineStyles(line) }} />
      );
    });
  };

  // Replace **bold** and *italics* inside lines
  const formatInlineStyles = (text: string) => {
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-amber-400">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-zinc-300">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-zinc-900/80 px-1.5 py-0.5 rounded text-xs border border-white/5 font-mono text-pink-400">$1</code>');
    return formatted;
  };

  return <div className="space-y-0.5">{parseMarkdown(content)}</div>;
};

export default MarkdownRenderer;
