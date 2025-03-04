// frontend/src/tests/setup.ts
import '@testing-library/jest-dom';
import React from 'react';
import 'jest-environment-jsdom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => ({ get: jest.fn() })),
  useParams: jest.fn(() => ({})),
}));

// Mock Next/Link component with a simpler version for Next.js 15+
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...rest }: any) {
    return React.createElement('a', { href, ...rest }, children);
  };
});

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

// Global test timeout
jest.setTimeout(30000);