import '@testing-library/jest-dom';

// Mock do fetch global
global.fetch = jest.fn();

// Mock do window.location
Object.defineProperty(window, 'location', {
  value: {
    href: '',
    search: '',
  },
  writable: true,
});

// Mock do Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

