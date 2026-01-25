import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/',
}));

// Mock environment variables for tests
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
process.env.SIGHTENGINE_API_USER = 'test_user';
process.env.SIGHTENGINE_API_SECRET = 'test_secret';
process.env.AI_DETECTION_PROVIDER = 'sightengine';
process.env.ANALYZE_ALL_IMAGES = 'false';
