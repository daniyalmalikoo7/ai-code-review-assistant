// src/components/settings/GithubConfigForm.tsx
'use client';

import React, { useState } from 'react';
import { GithubConfig } from '@/types/settings';
import { apiClient } from '@/lib/api';

interface GithubConfigFormProps {
  initialConfig: GithubConfig;
  onSave: (config: GithubConfig) => void;
}

export default function GithubConfigForm({ initialConfig, onSave }: GithubConfigFormProps) {
  const [config, setConfig] = useState<GithubConfig>(initialConfig);
  const [newRepo, setNewRepo] = useState<string>('');
  const [validating, setValidating] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; username?: string } | null>(null);
  const [tokenVisible, setTokenVisible] = useState<boolean>(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setConfig({
      ...config,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleAddRepository = () => {
    if (newRepo && !config.repositories.includes(newRepo)) {
      setConfig({
        ...config,
        repositories: [...config.repositories, newRepo]
      });
      setNewRepo('');
    }
  };
  
  const handleRemoveRepository = (repo: string) => {
    setConfig({
      ...config,
      repositories: config.repositories.filter(r => r !== repo)
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };
  
  const validateToken = async () => {
    if (!config.personalAccessToken) return;
    
    setValidating(true);
    try {
      const result = await apiClient.validateGithubToken(config.personalAccessToken);
      setValidationResult(result);
    } catch {
      setValidationResult({ valid: false });
    } finally {
      setValidating(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">GitHub Integration</h3>
            <p className="mt-1 text-sm text-gray-500">
              Configure GitHub integration to automatically analyze pull requests.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-4">
                <div className="flex items-start mb-2">
                  <div className="flex h-5 items-center">
                    <input
                      id="enabled"
                      name="enabled"
                      type="checkbox"
                      checked={config.enabled}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="enabled" className="font-medium text-gray-700">Enable GitHub Integration</label>
                    <p className="text-gray-500">When enabled, the system will analyze all pull requests in the selected repositories.</p>
                  </div>
                </div>
              </div>
              
              <div className="col-span-6 sm:col-span-4">
                <label htmlFor="personalAccessToken" className="block text-sm font-medium text-gray-700">
                  Personal Access Token
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type={tokenVisible ? "text" : "password"}
                    name="personalAccessToken"
                    id="personalAccessToken"
                    value={config.personalAccessToken || ''}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 pr-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setTokenVisible(!tokenVisible)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                  >
                    {tokenVisible ? (
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" clipRule="evenodd" />
                        <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Add a GitHub Personal Access Token with repo and user scopes to allow the app to access your repositories.
                </p>
                
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={validateToken}
                    disabled={!config.personalAccessToken || validating}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {validating ? 'Validating...' : 'Validate Token'}
                  </button>
                </div>
                
                {validationResult && (
                  <div className={`mt-2 text-sm ${validationResult.valid ? 'text-green-600' : 'text-red-600'}`}>
                    {validationResult.valid 
                      ? `✓ Token is valid (authenticated as ${validationResult.username})` 
                      : '✗ Invalid token. Please check your token and try again.'}
                  </div>
                )}
              </div>
              
              <div className="col-span-6 sm:col-span-4">
                <div className="flex items-start mb-2">
                  <div className="flex h-5 items-center">
                    <input
                      id="autoReview"
                      name="autoReview"
                      type="checkbox"
                      checked={config.autoReview}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="autoReview" className="font-medium text-gray-700">Automatic Review</label>
                    <p className="text-gray-500">Automatically review pull requests when they are opened or updated.</p>
                  </div>
                </div>
              </div>
              
              <div className="col-span-6 sm:col-span-4">
                <label htmlFor="webhookSecret" className="block text-sm font-medium text-gray-700">
                  Webhook Secret
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="webhookSecret"
                    id="webhookSecret"
                    value={config.webhookSecret || ''}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Enter the webhook secret you configured in GitHub, if using webhooks for integration.
                </p>
              </div>
              
              <div className="col-span-6">
                <label htmlFor="repositories" className="block text-sm font-medium text-gray-700">
                  Repositories
                </label>
                <div className="mt-1">
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="owner/repo"
                      value={newRepo}
                      onChange={(e) => setNewRepo(e.target.value)}
                      className="block w-full rounded-md rounded-r-none border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddRepository}
                      disabled={!newRepo}
                      className="inline-flex items-center rounded-md rounded-l-none border border-l-0 border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                </div>
                
                {config.repositories.length > 0 ? (
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Monitored Repositories</h4>
                    <div className="space-y-2">
                      {config.repositories.map((repo) => (
                        <div key={repo} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200">
                          <span className="text-sm">{repo}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRepository(repo)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">
                    No repositories added yet. Add repositories in the format &quot;owner/repo&quot;.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save
        </button>
      </div>
    </form>
  );
}