'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { codeToHtml } from 'shiki';
import { useEffect } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = 'typescript' }: CodeBlockProps) {
  const [highlighted, setHighlighted] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    codeToHtml(code, {
      lang: language,
      theme: 'github-dark',
    }).then(setHighlighted);
  }, [code, language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 rounded-lg bg-zinc-800/80 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-700 hover:text-zinc-200"
        aria-label="Copy code"
      >
        {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
      </button>
      <div 
        className="text-sm overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: highlighted }} 
      />
    </div>
  );
}
