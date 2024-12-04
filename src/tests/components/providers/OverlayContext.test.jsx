import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { OverlayProvider, useOverlay } from '@/components/providers';
import '@testing-library/jest-dom';

const TestComponent = () => {
  const overlay = useOverlay();
  return (
    <div>
      <div data-testid="overlay-state">
        {JSON.stringify({
          calendar: overlay.showCalendarOverlay,
          teacher: overlay.showTeacherProfileOverlay,
          student: overlay.showStudentProfileOverlay,
        })}
      </div>
      <button 
        onClick={() => overlay.setShowCalendarOverlay(true)}
        data-testid="show-calendar"
      >
        Show Calendar
      </button>
    </div>
  );
};

describe('OverlayProvider', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  test('initializes with all overlays hidden', () => {
    const { getByTestId } = render(
      <OverlayProvider>
        <TestComponent />
      </OverlayProvider>
    );

    const state = JSON.parse(getByTestId('overlay-state').textContent);
    expect(state.calendar).toBe(false);
    expect(state.teacher).toBe(false);
    expect(state.student).toBe(false);
  });

  test('shows calendar overlay correctly', () => {
    const { getByTestId } = render(
      <OverlayProvider>
        <TestComponent />
      </OverlayProvider>
    );

    act(() => {
      getByTestId('show-calendar').click();
    });

    const state = JSON.parse(getByTestId('overlay-state').textContent);
    expect(state.calendar).toBe(true);
  });

  test('logs state changes correctly', () => {
    const { getByTestId } = render(
      <OverlayProvider>
        <TestComponent />
      </OverlayProvider>
    );

    act(() => {
      getByTestId('show-calendar').click();
    });

    expect(console.log).toHaveBeenCalledWith(
      'showCalendarOverlay state changed:',
      true
    );
  });
}); 