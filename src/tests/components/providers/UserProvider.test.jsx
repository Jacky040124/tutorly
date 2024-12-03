import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, act, waitFor } from '@testing-library/react';
import { UserProvider, useUser } from '@/components/providers';
import { auth, db } from '@/lib/firebase';
import '@testing-library/jest-dom';

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  auth: {
    onAuthStateChanged: vi.fn(),
  },
  db: {
    doc: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    collection: vi.fn(),
    getDocs: vi.fn(),
    runTransaction: vi.fn(),
  },
}));

// Test Component
const TestComponent = () => {
  const userContext = useUser();
  return <div data-testid="user-context">{JSON.stringify(userContext)}</div>;
};

describe('UserProvider', () => {
  const mockTeacherData = {
    email: 'teacher@test.com',
    uid: 'teacher123',
    type: 'teacher',
    nickname: 'Test Teacher',
    description: 'Test Description',
    availability: [],
    pricing: 50
  };

  const mockStudentData = {
    email: 'student@test.com',
    uid: 'student123',
    type: 'student',
    nickname: 'Test Student',
    balance: 100,
    bookingHistory: []
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('initializes with null user and loading state', () => {
    auth.onAuthStateChanged.mockImplementation((callback) => {
      callback(null);
      return () => {};
    });

    const { getByTestId } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    const contextValue = JSON.parse(getByTestId('user-context').textContent);
    expect(contextValue.user).toBeNull();
    expect(contextValue.loading).toBe(false);
  });

  test('loads teacher data correctly on auth state change', async () => {
    const mockFirebaseUser = { uid: 'teacher123', email: 'teacher@test.com' };
    const mockDocSnap = { exists: () => true, data: () => mockTeacherData };

    auth.onAuthStateChanged.mockImplementation((callback) => {
      callback(mockFirebaseUser);
      return () => {};
    });

    db.doc.mockImplementation(() => mockDocSnap);
    db.getDoc.mockImplementation(() => mockDocSnap);
    db.setDoc.mockImplementation(() => {});
    db.collection.mockImplementation(() => ({
      doc: vi.fn(),
      getDocs: vi.fn(),
      runTransaction: vi.fn(),
    }));

    const { getByTestId } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    const contextValue = JSON.parse(getByTestId('user-context').textContent);
    expect(contextValue.user).toEqual(mockFirebaseUser);
    expect(contextValue.loading).toBe(false);
  });

  test('loads student data correctly on auth state change', async () => {
    const mockFirebaseUser = { uid: 'student123', email: 'student@test.com' };
    const mockDocSnap = { exists: () => true, data: () => mockStudentData };

    auth.onAuthStateChanged.mockImplementation((callback) => {
      callback(mockFirebaseUser);
      return () => {};
    });

    db.doc.mockImplementation(() => mockDocSnap);
    db.getDoc.mockImplementation(() => mockDocSnap);
    db.setDoc.mockImplementation(() => {});
    db.collection.mockImplementation(() => ({
      doc: vi.fn(),
      getDocs: vi.fn(),
      runTransaction: vi.fn(),
    }));

    const { getByTestId } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    const contextValue = JSON.parse(getByTestId('user-context').textContent);
    expect(contextValue.user).toEqual(mockFirebaseUser);
    expect(contextValue.loading).toBe(false);
  });
}); 