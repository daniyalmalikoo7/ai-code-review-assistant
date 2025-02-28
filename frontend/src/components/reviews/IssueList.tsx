// src/components/reviews/IssueList.tsx
import React, { useState } from 'react';
import { InlineComment, IssueCategory, IssueSeverity } from '@/types/review';
import { getSeverityEmoji, getSeverityColor } from '@/lib/api';

interface IssueListProps {
  issues: InlineComment[];
  onIssueSelect: (issue: InlineComment) => void;
}

export default function IssueList({ issues, onIssueSelect }: IssueListProps) {
  const [filter, setFilter] = useState({
    severity: 'all',
    category: 'all',
    file: 'all'
  });
  
  // Get unique files for filtering
  const files = ['all', ...new Set(issues.map(issue => issue.file))];
  
  // Apply filters
  const filteredIssues = issues.filter(issue => {
    if (filter.severity !== 'all' && issue.severity !== filter.severity) {
      return false;
    }
    if (filter.category !== 'all' && issue.category !== filter.category) {
      return false;
    }
    if (filter.file !== 'all' && issue.file !== filter.file) {
      return false;
    }
    return true;
  });
  
  // Group issues by file
  const issuesByFile: Record<string, InlineComment[]> = {};
  filteredIssues.forEach(issue => {
    if (!issuesByFile[issue.file]) {
      issuesByFile[issue.file] = [];
    }
    issuesByFile[issue.file].push(issue);
  });
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Issues ({filteredIssues.length})
        </h3>
        
        <div className="flex space-x-2">
          <select
            value={filter.severity}
            onChange={(e) => setFilter({...filter, severity: e.target.value})}
            className="rounded-md border-gray-300 py-1 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Severities</option>
            {Object.values(IssueSeverity).map(severity => (
              <option key={severity} value={severity}>{severity}</option>
            ))}
          </select>
          
          <select
            value={filter.category}
            onChange={(e) => setFilter({...filter, category: e.target.value})}
            className="rounded-md border-gray-300 py-1 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {Object.values(IssueCategory).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select
            value={filter.file}
            onChange={(e) => setFilter({...filter, file: e.target.value})}
            className="rounded-md border-gray-300 py-1 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Files</option>
            {files.filter(file => file !== 'all').map(file => (
              <option key={file} value={file}>{file}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="border-t border-gray-200">
        {Object.entries(issuesByFile).map(([file, fileIssues]) => (
          <div key={file} className="border-b border-gray-200 last:border-b-0">
            <div className="bg-gray-50 px-4 py-3">
              <h4 className="text-sm font-medium text-gray-700 truncate">{file}</h4>
            </div>
            
            <ul className="divide-y divide-gray-200">
              {fileIssues.map((issue) => (
                <li 
                  key={issue.suggestionId}
                  onClick={() => onIssueSelect(issue)}
                  className="px-4 py-4 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-start">
                    <div className="mr-4 flex-shrink-0">
                      <span className="text-2xl" aria-hidden="true">
                        {getSeverityEmoji(issue.severity)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                          {issue.severity}
                        </span>
                        <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          {issue.category}
                        </span>
                        <span className="ml-3 text-sm text-gray-500">
                          Line {issue.line}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {issue.message.split('\n')[0].replace(/🚨|⚠️|💡|\*\*/g, '').trim()}
                      </div>
                    </div>
                    <div className="ml-5 flex-shrink-0">
                      <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
        
        {filteredIssues.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            No issues match the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}