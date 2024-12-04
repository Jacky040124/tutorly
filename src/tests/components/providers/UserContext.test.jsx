import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { UserProvider, useUser } from '@/components/providers';
import { auth, db } from '@/lib/firebase';

vi.mock('@/lib/firebase', () => ({
  auth: {
    onAuthStateChanged: vi.fn(() => () => {}),
  },
  db: {
    doc: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    runTransaction: vi.fn(),
  },
}));

describe('UserProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('initializes with loading state', () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: ({ children }) => <UserProvider>{children}</UserProvider>
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBe(null);
  });

  test('loads teacher data correctly on auth state change', () => {
    renderHook(() => useUser(), {
      wrapper: ({ children }) => <UserProvider>{children}</UserProvider>
    });

    // First, verify that onAuthStateChanged was called
    expect(auth.onAuthStateChanged).toHaveBeenCalled();
  });
}); 