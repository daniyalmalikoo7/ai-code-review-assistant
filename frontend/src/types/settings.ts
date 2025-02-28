// src/types/settings.ts

export interface GithubConfig {
    personalAccessToken?: string;
    webhookSecret?: string;
    enabled: boolean;
    repositories: string[];
    autoReview: boolean;
  }
  
  export interface ApiConfig {
    backendUrl: string;
    apiKey?: string;
  }
  
  export interface NotificationSettings {
    email: boolean;
    emailAddress?: string;
    slack: boolean;
    slackWebhook?: string;
    notifyOnCritical: boolean;
    notifyOnComplete: boolean;
  }
  
  export interface UserSettings {
    github: GithubConfig;
    api: ApiConfig;
    notifications: NotificationSettings;
  }