// src/components/reviews/CodeBlock.tsx
import React from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
  highlight?: number[];
  filename?: string;
}

export default function CodeBlock({ code, /* language = 'plaintext', */ highlight = [], filename }: CodeBlockProps) {
  // Split code into lines for rendering and highlighting
  const lines = code.split('\n');
  
  return (
    <div className="overflow-hidden rounded-lg bg-gray-900 shadow">
      {filename && (
        <div className="bg-gray-800 px-4 py-2 text-xs text-gray-300 border-b border-gray-700">
          {filename}
        </div>
      )}
      <div className="overflow-x-auto">
        <pre className="font-mono text-xs leading-5 p-0 m-0">
          <div className="p-4 text-white space-y-0">
            {lines.map((line, index) => (
              <div 
                key={index} 
                className={`${highlight.includes(index + 1) ? 'bg-yellow-900 -mx-4 px-4' : ''} whitespace-pre`}
                data-line-number={index + 1}
              >
                <span className="inline-block w-8 text-right pr-2 select-none text-gray-500">
                  {index + 1}
                </span>
                <span>{line || ' '}</span>
              </div>
            ))}
          </div>
        </pre>
      </div>
    </div>
  );
}