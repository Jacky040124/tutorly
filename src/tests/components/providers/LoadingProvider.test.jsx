import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { LoadingProvider, useLoading } from '@/components/providers';
import '@testing-library/jest-dom';

const TestComponent = () => {
  const { isLoading, setIsLoading } = useLoading();
  return (
    <div>
      <div data-testid="loading-state">{JSON.stringify(isLoading())}</div>
      <button 
        onClick={() => setIsLoading('test', true)} 
        data-testid="set-loading"
      >
        Set Loading
      </button>
    </div>
  );
};

describe('LoadingProvider', () => {
  test('initializes with no loading states', () => {
    const { getByTestId } = render(
      <LoadingProvider>
        <TestComponent />
      </LoadingProvider>
    );

    expect(getByTestId('loading-state')).toHaveTextContent('false');
  });

  test('sets loading state correctly', () => {
    const { getByTestId } = render(
      <LoadingProvider>
        <TestComponent />
      </LoadingProvider>
    );

    act(() => {
      getByTestId('set-loading').click();
    });

    expect(getByTestId('loading-state')).toHaveTextContent('true');
  });

  test('handles multiple loading states', () => {
    const { getByTestId } = render(
      <LoadingProvider>
        <TestComponent />
      </LoadingProvider>
    );

    act(() => {
      const { setIsLoading } = useLoading();
      setIsLoading('test1', true);
      setIsLoading('test2', true);
      setIsLoading('test3', false);
    });

    expect(getByTestId('loading-state')).toHaveTextContent('true');
  });
}); 