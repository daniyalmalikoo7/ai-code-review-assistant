// src/components/settings/NotificationSettings.tsx
'use client';

import React, { useState } from 'react';
import { NotificationSettings as NotificationConfig } from '@/types/settings';

interface NotificationSettingsProps {
  initialSettings: NotificationConfig;
  onSave: (settings: NotificationConfig) => void;
}

export default function NotificationSettings({ initialSettings, onSave }: NotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationConfig>(initialSettings);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
  };
  
  const testEmail = async () => {
    if (!settings.email || !settings.emailAddress) return;
    
    // In a real app, we would call the API to send a test email
    alert(`A test notification would be sent to ${settings.emailAddress}`);
  };
  
  const testSlack = async () => {
    if (!settings.slack || !settings.slackWebhook) return;
    
    // In a real app, we would call the API to send a test Slack message
    alert(`A test notification would be sent to the Slack webhook`);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Notification Settings</h3>
            <p className="mt-1 text-sm text-gray-500">
              Configure how you want to be notified about code review results.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6">
                <fieldset>
                  <legend className="text-base font-medium text-gray-900">Email Notifications</legend>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id="email"
                          name="email"
                          type="checkbox"
                          checked={settings.email}
                          onChange={handleChange}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="email" className="font-medium text-gray-700">Enable Email Notifications</label>
                        <p className="text-gray-500">Receive review summaries and alerts via email.</p>
                      </div>
                    </div>
                    
                    {settings.email && (
                      <div className="ml-5 col-span-6 sm:col-span-4">
                        <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700">
                          Email Address
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                          <input
                            type="email"
                            name="emailAddress"
                            id="emailAddress"
                            value={settings.emailAddress || ''}
                            onChange={handleChange}
                            className="block w-full flex-1 rounded-none rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="you@example.com"
                          />
                          <button
                            type="button"
                            onClick={testEmail}
                            disabled={!settings.emailAddress}
                            className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                          >
                            Test
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </fieldset>
              </div>
              
              <div className="col-span-6">
                <fieldset>
                  <legend className="text-base font-medium text-gray-900">Slack Notifications</legend>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id="slack"
                          name="slack"
                          type="checkbox"
                          checked={settings.slack}
                          onChange={handleChange}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="slack" className="font-medium text-gray-700">Enable Slack Notifications</label>
                        <p className="text-gray-500">Receive review summaries and alerts via Slack.</p>
                      </div>
                    </div>
                    
                    {settings.slack && (
                      <div className="ml-5 col-span-6 sm:col-span-4">
                        <label htmlFor="slackWebhook" className="block text-sm font-medium text-gray-700">
                          Slack Webhook URL
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                          <input
                            type="text"
                            name="slackWebhook"
                            id="slackWebhook"
                            value={settings.slackWebhook || ''}
                            onChange={handleChange}
                            className="block w-full flex-1 rounded-none rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="https://hooks.slack.com/services/..."
                          />
                          <button
                            type="button"
                            onClick={testSlack}
                            disabled={!settings.slackWebhook}
                            className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                          >
                            Test
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </fieldset>
              </div>
              
              <div className="col-span-6">
                <fieldset>
                  <legend className="text-base font-medium text-gray-900">Notification Preferences</legend>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id="notifyOnCritical"
                          name="notifyOnCritical"
                          type="checkbox"
                          checked={settings.notifyOnCritical}
                          onChange={handleChange}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="notifyOnCritical" className="font-medium text-gray-700">Notify on Critical Issues</label>
                        <p className="text-gray-500">Receive notifications when critical issues are found in code reviews.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id="notifyOnComplete"
                          name="notifyOnComplete"
                          type="checkbox"
                          checked={settings.notifyOnComplete}
                          onChange={handleChange}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="notifyOnComplete" className="font-medium text-gray-700">Notify on Review Completion</label>
                        <p className="text-gray-500">Receive notifications when a code review is completed.</p>
                      </div>
                    </div>
                  </div>
                </fieldset>
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