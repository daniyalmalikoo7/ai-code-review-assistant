// src/app/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GithubConfigForm from '@/components/settings/GithubConfigForm';
import ApiTokenForm from '@/components/settings/ApiTokenForm';
import NotificationSettings from '@/components/settings/NotificationSettings';
import { UserSettings } from '@/types/settings';
// import { apiClient } from '@/lib/api';

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<{
    saving: boolean;
    success?: boolean;
    message?: string;
  }>({ saving: false });
  
  // Tabs for different settings sections
  const [activeTab, setActiveTab] = useState<'github' | 'api' | 'notifications'>('github');
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real app, we would fetch from the API
        // const data = await apiClient.getSettings();
        
        // For demo purposes, using mock data
        const mockSettings: UserSettings = {
          github: {
            personalAccessToken: '',
            webhookSecret: '',
            enabled: false,
            repositories: [],
            autoReview: true
          },
          api: {
            backendUrl: 'http://localhost:3001',
            apiKey: ''
          },
          notifications: {
            email: false,
            emailAddress: '',
            slack: false,
            slackWebhook: '',
            notifyOnCritical: true,
            notifyOnComplete: true
          }
        };
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setSettings(mockSettings);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch settings:', err);
        setError('Failed to load settings. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  const handleSaveGithubConfig = async (githubConfig: UserSettings['github']) => {
    if (!settings) return;
    
    try {
      setSaveStatus({ saving: true });
      
      // Update settings
      const updatedSettings = {
        ...settings,
        github: githubConfig
      };
      
      // In a real app, we would save to the API
      // await apiClient.saveSettings(updatedSettings);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSettings(updatedSettings);
      setSaveStatus({ saving: false, success: true, message: 'GitHub settings saved successfully!' });
      
      // Reset status message after 3 seconds
      setTimeout(() => {
        setSaveStatus({ saving: false });
      }, 3000);
    } catch (err) {
      console.error('Failed to save GitHub settings:', err);
      setSaveStatus({ saving: false, success: false, message: 'Failed to save settings. Please try again.' });
    }
  };
  
  const handleSaveApiConfig = async (apiConfig: UserSettings['api']) => {
    if (!settings) return;
    
    try {
      setSaveStatus({ saving: true });
      
      // Update settings
      const updatedSettings = {
        ...settings,
        api: apiConfig
      };
      
      // In a real app, we would save to the API
      // await apiClient.saveSettings(updatedSettings);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSettings(updatedSettings);
      setSaveStatus({ saving: false, success: true, message: 'API settings saved successfully!' });
      
      // Reset status message after 3 seconds
      setTimeout(() => {
        setSaveStatus({ saving: false });
      }, 3000);
    } catch (err) {
      console.error('Failed to save API settings:', err);
      setSaveStatus({ saving: false, success: false, message: 'Failed to save settings. Please try again.' });
    }
  };
  
  const handleSaveNotificationSettings = async (notificationSettings: UserSettings['notifications']) => {
    if (!settings) return;
    
    try {
      setSaveStatus({ saving: true });
      
      // Update settings
      const updatedSettings = {
        ...settings,
        notifications: notificationSettings
      };
      
      // In a real app, we would save to the API
      // await apiClient.saveSettings(updatedSettings);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSettings(updatedSettings);
      setSaveStatus({ saving: false, success: true, message: 'Notification settings saved successfully!' });
      
      // Reset status message after 3 seconds
      setTimeout(() => {
        setSaveStatus({ saving: false });
      }, 3000);
    } catch (err) {
      console.error('Failed to save notification settings:', err);
      setSaveStatus({ saving: false, success: false, message: 'Failed to save settings. Please try again.' });
    }
  };

  return (
    <DashboardLayout>
      <header className="bg-white shadow-sm mb-6 -mt-6 py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Settings</h1>
      </header>
      
      <main>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-gray-600">Loading settings...</p>
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        ) : settings ? (
          <>
            {/* Save Status Message */}
            {saveStatus.message && (
              <div className={`mb-6 rounded-md p-4 ${saveStatus.success ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {saveStatus.success ? (
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${saveStatus.success ? 'text-green-800' : 'text-red-800'}`}>
                      {saveStatus.message}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Settings Tabs */}
            <div className="mb-8 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('github')}
                  className={`
                    whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
                    ${activeTab === 'github' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}
                  `}
                >
                  GitHub Integration
                </button>
                <button
                  onClick={() => setActiveTab('api')}
                  className={`
                    whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
                    ${activeTab === 'api' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}
                  `}
                >
                  API Configuration
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`
                    whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
                    ${activeTab === 'notifications' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}
                  `}
                >
                  Notifications
                </button>
              </nav>
            </div>
            
            {/* Settings Forms */}
            <div>
              {activeTab === 'github' && (
                <GithubConfigForm 
                  initialConfig={settings.github} 
                  onSave={handleSaveGithubConfig} 
                />
              )}
              
              {activeTab === 'api' && (
                <ApiTokenForm 
                  initialConfig={settings.api} 
                  onSave={handleSaveApiConfig} 
                />
              )}
              
              {activeTab === 'notifications' && (
                <NotificationSettings 
                  initialSettings={settings.notifications} 
                  onSave={handleSaveNotificationSettings} 
                />
              )}
            </div>
          </>
        ) : null}
      </main>
    </DashboardLayout>
  );
}