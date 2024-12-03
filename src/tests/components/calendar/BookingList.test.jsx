import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BookingList from '@/components/calendar/BookingList';
import { useBooking, useUser } from '@/components/providers';
import '@testing-library/jest-dom';

// Mock the providers
vi.mock('@/components/providers', () => ({
  useBooking: vi.fn(),
  useUser: vi.fn()
}));

describe('BookingList', () => {
  const mockBookings = [
    {
      id: '1',
      date: { year: 2024, month: 3, day: 15 },
      startTime: 9,
      endTime: 10,
      studentId: 'student1',
      teacherId: 'teacher1',
      link: 'https://meet.google.com/123'
    }
  ];

  const mockTeacherList = {
    teacher1: {
      nickname: 'John Doe',
      email: 'john@example.com'
    }
  };

  test('renders bookings correctly', () => {
    // Mock the provider hooks
    useBooking.mockReturnValue({
      bookings: mockBookings,
      setBookings: vi.fn()
    });

    useUser.mockReturnValue({
      user: { type: 'student' },
      teacherList: mockTeacherList,
      selectedTeacher: 'teacher1'
    });

    render(<BookingList />);

    // Check if date is displayed
    expect(screen.getByText('15/3/2024')).toBeInTheDocument();

    // Check if time is displayed
    expect(screen.getByText('9:00 - 10:00')).toBeInTheDocument();

    // Check if teacher name is displayed
    expect(screen.getByText('Teacher: John Doe')).toBeInTheDocument();

    // Check if meet button exists
    expect(screen.getByText('Meet')).toBeInTheDocument();
  });

  test('displays empty state when no bookings', () => {
    useBooking.mockReturnValue({
      bookings: [],
      setBookings: vi.fn()
    });

    useUser.mockReturnValue({
      user: { type: 'student' },
      teacherList: {},
      selectedTeacher: null
    });

    render(<BookingList />);
    
    expect(screen.getByText('Your Bookings')).toBeInTheDocument();
  });
});
