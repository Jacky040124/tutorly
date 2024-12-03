import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, act, waitFor } from '@testing-library/react';
import { ErrorProvider, useError } from '@/components/providers';
import '@testing-library/jest-dom';

const TestComponent = () => {
  const { error, showError, clearError } = useError();
  return (
    <div>
      <div data-testid="error-message">{error}</div>
      <button onClick={() => showError('Test error')} data-testid="show-error">
        Show Error
      </button>
      <button onClick={clearError} data-testid="clear-error">
        Clear Error
      </button>
    </div>
  );
};

describe('ErrorProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('shows error message correctly', () => {
    const { getByTestId } = render(
      <ErrorProvider>
        <TestComponent />
      </ErrorProvider>
    );

    act(() => {
      getByTestId('show-error').click();
    });

    expect(getByTestId('error-message')).toHaveTextContent('Test error');
  });

  test('clears error message after timeout', async () => {
    const { getByTestId } = render(
      <ErrorProvider>
        <TestComponent />
      </ErrorProvider>
    );

    act(() => {
      getByTestId('show-error').click();
    });

    expect(getByTestId('error-message')).toHaveTextContent('Test error');

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(getByTestId('error-message')).toHaveTextContent('');
    });
  });

  test('clears error message manually', () => {
    const { getByTestId } = render(
      <ErrorProvider>
        <TestComponent />
      </ErrorProvider>
    );

    act(() => {
      getByTestId('show-error').click();
    });

    expect(getByTestId('error-message')).toHaveTextContent('Test error');

    act(() => {
      getByTestId('clear-error').click();
    });

    expect(getByTestId('error-message')).toHaveTextContent('');
  });
}); 