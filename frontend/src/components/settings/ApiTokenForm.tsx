// src/components/settings/ApiTokenForm.tsx
'use client';

import React, { useState } from 'react';
import { ApiConfig } from '@/types/settings';

interface ApiTokenFormProps {
  initialConfig: ApiConfig;
  onSave: (config: ApiConfig) => void;
}

export default function ApiTokenForm({ initialConfig, onSave }: ApiTokenFormProps) {
  const [config, setConfig] = useState<ApiConfig>(initialConfig);
  const [tokenVisible, setTokenVisible] = useState<boolean>(false);
  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<{success: boolean; message: string} | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig({
      ...config,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  const testConnection = async () => {
    setTestingConnection(true);
    try {
      // In a real app, we would make an actual API call to test the connection
      // const response = await fetch(`${config.backendUrl}/api/health`, {
      //   headers: config.apiKey ? { 'Authorization': `Bearer ${config.apiKey}` } : {}
      // });
      // if (response.ok) {
      //   setConnectionStatus({ success: true, message: 'Connection successful! Backend is reachable.' });
      // } else {
      //   setConnectionStatus({ success: false, message: `Error: ${response.status} ${response.statusText}` });
      // }

      // For demo, simulate a successful connection after a short delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConnectionStatus({ success: true, message: 'Connection successful! Backend is reachable.' });
    } catch (error) {
      setConnectionStatus({ success: false, message: `Error: Could not connect to backend. ${error}` });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">API Configuration</h3>
            <p className="mt-1 text-sm text-gray-500">
              Configure the connection to the backend API service.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-4">
                <label htmlFor="backendUrl" className="block text-sm font-medium text-gray-700">
                  Backend URL
                </label>
                <input
                  type="url"
                  name="backendUrl"
                  id="backendUrl"
                  value={config.backendUrl}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="http://localhost:3001"
                />
                <p className="mt-1 text-sm text-gray-500">
                  The URL of the backend API server.
                </p>
              </div>
              
              <div className="col-span-6 sm:col-span-4">
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                  API Key
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type={tokenVisible ? "text" : "password"}
                    name="apiKey"
                    id="apiKey"
                    value={config.apiKey || ''}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 pr-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Enter API key if required"
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
                  Enter an API key if the backend requires authentication.
                </p>
              </div>
              
              <div className="col-span-6">
                <button
                  type="button"
                  onClick={testConnection}
                  disabled={testingConnection || !config.backendUrl}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {testingConnection ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Testing Connection...
                    </>
                  ) : (
                    "Test Connection"
                  )}
                </button>
                
                {connectionStatus && (
                  <div className={`mt-2 p-2 text-sm rounded ${connectionStatus.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {connectionStatus.success ? '✓ ' : '✗ '}{connectionStatus.message}
                  </div>
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