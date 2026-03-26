import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApiClient } from '../create-api-client';

vi.mock('axios', () => {
  const instanceFn = vi.fn();
  const mockInstance = Object.assign(instanceFn, {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  });
  return {
    default: {
      create: vi.fn(() => mockInstance),
    },
  };
});

describe('createApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(() => null),
      },
      writable: true,
      configurable: true,
    });
  });

  it('지정된 baseURL로 ApiClient를 생성한다', () => {
    const client = createApiClient({
      baseURL: 'http://localhost:3000',
      loginPath: '/login',
    });

    expect(client).toBeDefined();
  });

  it('ApiClient 인스턴스를 반환한다', () => {
    const client = createApiClient({
      baseURL: 'http://localhost:8080',
      loginPath: '/auth/login',
    });

    expect(client.get).toBeDefined();
    expect(client.post).toBeDefined();
    expect(client.put).toBeDefined();
    expect(client.patch).toBeDefined();
    expect(client.delete).toBeDefined();
  });
});
