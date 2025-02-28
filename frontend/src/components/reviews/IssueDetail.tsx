// src/components/reviews/IssueDetail.tsx
import React from 'react';
import { InlineComment } from '@/types/review';
import { getSeverityColor, getSeverityEmoji } from '@/lib/api';
import CodeBlock from './CodeBlock';

interface IssueDetailProps {
  issue: InlineComment;
  fileContent?: string;
}

export default function IssueDetail({ issue, fileContent }: IssueDetailProps) {
  // Extract details from the issue message
  const messageLines = issue.message.split('\n');
  const title = messageLines[0].replace(/🚨|⚠️|💡|\*\*/g, '').trim();
  
  // Try to find the description, snippet, and remediation
  let description = '';
  let snippet = '';
  let remediation = '';
  
  messageLines.forEach((line, index) => {
    if (index > 0) {
      if (line.includes('```') && !snippet) {
        // Start of code snippet
        let snippetContent = '';
        for (let i = index + 1; i < messageLines.length; i++) {
          if (messageLines[i].includes('```')) {
            break;
          }
          snippetContent += messageLines[i] + '\n';
        }
        snippet = snippetContent.trim();
      } else if (line.includes('**Why it matters**:')) {
        description = line.replace('**Why it matters**:', '').trim();
      } else if (line.includes('**Recommendation**:')) {
        remediation = line.replace('**Recommendation**:', '').trim();
      } else if (!description && !line.includes('```') && line.trim() !== '') {
        description = line.trim();
      }
    }
  });

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center">
          <span className="text-2xl mr-3" aria-hidden="true">
            {getSeverityEmoji(issue.severity)}
          </span>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {title}
          </h3>
        </div>
        <div className="mt-2 flex gap-2">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getSeverityColor(issue.severity)}`}>
            {issue.severity}
          </span>
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            {issue.category}
          </span>
        </div>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-500">Location</h4>
          <p className="mt-1 text-sm text-gray-900">
            {issue.file} (Line {issue.line})
          </p>
        </div>
        
        {description && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500">Description</h4>
            <p className="mt-1 text-sm text-gray-900">{description}</p>
          </div>
        )}
        
        {remediation && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500">Recommendation</h4>
            <p className="mt-1 text-sm text-gray-900">{remediation}</p>
          </div>
        )}
        
        {snippet && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Code Snippet</h4>
            <CodeBlock code={snippet} highlight={[]} />
          </div>
        )}
        
        {fileContent && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">File Content</h4>
            <CodeBlock 
              code={fileContent} 
              filename={issue.file}
              highlight={[issue.line]} 
            />
          </div>
        )}
      </div>
    </div>
  );
}