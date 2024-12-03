import React from "react";
import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BookingOverlay from "@/components/calendar/BookingOverlay";
import { useUser, useBooking } from "@/components/providers";
import "@testing-library/jest-dom";

// Mock the providers
vi.mock("@/components/providers", () => ({
  useUser: vi.fn(),
  useBooking: vi.fn(),
}));

// Mock the booking service
vi.mock("@/services/booking.service", () => ({
  handleBookingConfirmed: vi.fn(),
}));

describe("BookingOverlay", () => {
  const mockSelectedSlot = {
    date: { year: 2024, month: 3, day: 15 },
    startTime: 9,
    endTime: 10,
    isRepeating: false,
    totalClasses: null,
    link: "https://meet.google.com/123",
  };

  const mockTeacherData = {
    nickname: "John Doe",
    email: "john@example.com",
    pricing: 50,
    availability: [],
  };

  beforeEach(() => {
    // Setup default mocks
    useBooking.mockReturnValue({
      selectedSlot: mockSelectedSlot,
      setShowBookingOverlay: vi.fn(),
      setBookingConfirmed: vi.fn(),
    });

    useUser.mockReturnValue({
      user: { email: "student@example.com", balance: 100 },
      selectedTeacher: "teacher1",
      teacherList: {
        teacher1: mockTeacherData,
      },
    });
  });

  test("renders booking confirmation details correctly", () => {
    render(<BookingOverlay />);

    // Use more specific queries
    expect(screen.getByRole('heading', { name: /confirm booking/i })).toBeInTheDocument();
    expect(screen.getByText(/teacher: john doe/i)).toBeInTheDocument();
    expect(screen.getByText(/15\/3\/2024/)).toBeInTheDocument();
    expect(screen.getByText(/time: 9:00 - 10:00/i)).toBeInTheDocument();
    expect(screen.getByText(/price per lesson: \$50/i)).toBeInTheDocument();
  });

  test("handles booking confirmation", async () => {
    const mockSetShowBookingOverlay = vi.fn();
    useBooking.mockReturnValue({
      selectedSlot: mockSelectedSlot,
      setShowBookingOverlay: mockSetShowBookingOverlay,
      setBookingConfirmed: vi.fn(),
    });

    render(<BookingOverlay />);

    const confirmButton = screen.getByRole('button', { name: /confirm booking/i });
    await fireEvent.click(confirmButton);

    expect(mockSetShowBookingOverlay).toHaveBeenCalledWith(false);
  });

  test("displays recurring booking information when applicable", () => {
    const recurringSlot = {
      ...mockSelectedSlot,
      isRepeating: true,
      totalClasses: 4,
    };

    useBooking.mockReturnValue({
      selectedSlot: recurringSlot,
      setShowBookingOverlay: vi.fn(),
      setBookingConfirmed: vi.fn(),
    });

    render(<BookingOverlay />);

    // Use more specific queries for split text
    expect(screen.getByText(/total for 4 lessons: \$200/i)).toBeInTheDocument();
    expect(screen.getByText(/weekly lessons for 4 weeks/i)).toBeInTheDocument();
  });

  test("shows insufficient balance error", async () => {
    useUser.mockReturnValue({
      user: { email: "student@example.com", balance: 20 },
      selectedTeacher: "teacher1",
      teacherList: {
        teacher1: mockTeacherData,
      },
    });

    // Mock window.alert
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<BookingOverlay />);

    const confirmButton = screen.getByRole('button', { name: /confirm booking/i });
    await fireEvent.click(confirmButton);

    expect(alertMock).toHaveBeenCalledWith('Insufficient balance. Required: $50');
    alertMock.mockRestore();
  });

  test("handles close button click", () => {
    const mockSetShowBookingOverlay = vi.fn();
    useBooking.mockReturnValue({
      selectedSlot: mockSelectedSlot,
      setShowBookingOverlay: mockSetShowBookingOverlay,
      setBookingConfirmed: vi.fn(),
    });

    render(<BookingOverlay />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockSetShowBookingOverlay).toHaveBeenCalledWith(false);
  });
});