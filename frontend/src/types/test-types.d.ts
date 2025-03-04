// src/types/test-types.d.ts
import { IssueSeverity, IssueCategory } from './review';

// Extend global Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveAttribute(attribute: string, value?: string): R;
    }
  }
}

// Declare module types for test files
declare module '@testing-library/jest-dom';

// Types for next/navigation
declare module 'next/navigation' {
  export function useRouter(): {
    push: (url: string) => void;
    replace: (url: string) => void;
    back: () => void;
    forward: () => void;
    prefetch: (url: string) => void;
  };
  
  export function usePathname(): string;
  
  export function useSearchParams(): {
    get: (key: string) => string | null;
  };
  
  export function useParams(): {
    [key: string]: string | string[] | undefined;
  };
}

// MSW type augmentations
declare module 'msw' {
  export interface ResponseResolver<T extends MockedRequest, Y> {
    (req: T, res: ResponseComposition, ctx: ResponseTransformer): Y;
  }
}