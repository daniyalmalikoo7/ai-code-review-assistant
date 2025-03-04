// frontend/src/types/environment.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      NEXT_PUBLIC_BACKEND_URL?: string;
      NEXT_PUBLIC_API_VERSION?: string;
    }
  }
}

// Ensure this is treated as a module
export {};
