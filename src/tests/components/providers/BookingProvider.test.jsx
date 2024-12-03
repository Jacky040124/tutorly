import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { BookingProvider, useBooking } from '@/components/providers';
import '@testing-library/jest-dom';

const TestComponent = () => {
  const bookingContext = useBooking();
  return <div data-testid="booking-context">{JSON.stringify(bookingContext)}</div>;
};

describe('BookingProvider', () => {
  test('provides initial state correctly', () => {
    const { getByTestId } = render(
      <BookingProvider>
        <TestComponent />
      </BookingProvider>
    );

    const contextValue = JSON.parse(getByTestId('booking-context').textContent);
    expect(contextValue.selectedSlot).toBeNull();
    expect(contextValue.showBookingOverlay).toBe(false);
    expect(contextValue.futureBookings).toEqual([]);
    expect(contextValue.bookings).toEqual([]);
    expect(contextValue.bookingConfirmed).toBe(false);
  });

  test('updates selected slot correctly', () => {
    const { getByTestId } = render(
      <BookingProvider>
        <TestComponent />
      </BookingProvider>
    );

    const mockSlot = { date: '2024-03-15', time: '09:00' };

    act(() => {
      const contextValue = JSON.parse(getByTestId('booking-context').textContent);
      contextValue.setSelectedSlot(mockSlot);
    });

    const updatedContextValue = JSON.parse(getByTestId('booking-context').textContent);
    expect(updatedContextValue.selectedSlot).toEqual(mockSlot);
  });

  // Add more tests...
}); 