import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.dataset.theme = 'dark';
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({ matches: query.includes('reduced-motion'), media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  });
});

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
