import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Calendar from "@/components/calendar/Calendar";
import { useUser, useBooking, useError } from "@/components/providers";
import { getTeacherBookings, getStudentBookings } from "@/services/booking.service";
import "@testing-library/jest-dom";

// Mock the providers
vi.mock("@/components/providers", () => ({
  useUser: vi.fn(),
  useBooking: vi.fn(),
  useError: vi.fn(),
}));

// Mock the services
vi.mock("@/services/booking.service", () => ({
  getTeacherBookings: vi.fn(),
  getStudentBookings: vi.fn(),
}));

describe("Calendar", () => {
  const mockTeacherData = {
    uid: "teacher1",
    type: "teacher",
    availability: [
      { day: 1, slots: [9, 10, 11] },
      { day: 2, slots: [14, 15, 16] },
    ],
  };

  const mockBookings = [
    {
      id: "booking1",
      date: { year: 2024, month: 3, day: 15 },
      startTime: 9,
      endTime: 10,
      studentId: "student1",
      teacherId: "teacher1",
    },
  ];

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup default provider mocks
    useUser.mockReturnValue({
      user: { type: "student", uid: "student1" },
      selectedTeacher: "teacher1",
      teacherList: { teacher1: mockTeacherData },
      userLoading: false,
    });

    useBooking.mockReturnValue({
      setSelectedSlot: vi.fn(),
      showBookingOverlay: false,
      setShowBookingOverlay: vi.fn(),
      setFutureBookings: vi.fn(),
      bookings: mockBookings,
      setBookings: vi.fn(),
      bookingConfirmed: false,
    });

    useError.mockReturnValue({
      showError: vi.fn(),
    });

    // Setup service mocks
    getTeacherBookings.mockResolvedValue(mockBookings);
    getStudentBookings.mockResolvedValue(mockBookings);
  });

  test("renders calendar with correct structure", () => {
    render(<Calendar />);

    // Check for the month display
    expect(screen.getByRole("heading")).toBeInTheDocument();

    // Check for navigation buttons
    expect(screen.getByRole("button", { name: /previous week/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next week/i })).toBeInTheDocument();

    // Check for weekday labels
    expect(screen.getByText(/mon/i)).toBeInTheDocument();
    expect(screen.getByText(/tue/i)).toBeInTheDocument();
  });

  test("handles week navigation within same month", () => {
    render(<Calendar />);

    // Get initial month display
    const initialMonth = screen.getByRole("heading").textContent;

    const prevWeekButton = screen.getByRole("button", { name: /previous week/i });
    const nextWeekButton = screen.getByRole("button", { name: /next week/i });

    // Navigate forward and back
    fireEvent.click(nextWeekButton);
    fireEvent.click(prevWeekButton);

    // Should be back to initial month
    expect(screen.getByRole("heading")).toHaveTextContent(initialMonth);
  });

  test("handles week navigation across month boundary", () => {
    // Mock a specific date to ensure consistent testing
    vi.useFakeTimers();
    // Set to March 25, 2024 (Monday)
    vi.setSystemTime(new Date(2024, 2, 25));

    render(<Calendar />);

    // Initial heading should show "March 2024"
    const initialHeading = screen.getByRole("heading");
    expect(initialHeading).toHaveTextContent("March 2024");

    // Click next week to reach April
    // (March 25 -> April 1)
    const nextWeekButton = screen.getByRole("button", { name: /next week/i });
    fireEvent.click(nextWeekButton);

    // Should now show "April 2024"
    expect(screen.getByRole("heading")).toHaveTextContent("April 2024");

    // Click previous week to go back to March
    const prevWeekButton = screen.getByRole("button", { name: /previous week/i });
    fireEvent.click(prevWeekButton);

    // Should show March again
    expect(screen.getByRole("heading")).toHaveTextContent("March 2024");

    vi.useRealTimers();
  });

  test("fetches and displays teacher bookings", async () => {
    useUser.mockReturnValue({
      user: { type: "teacher", uid: "teacher1" },
      selectedTeacher: null,
      teacherList: {},
      userLoading: false,
    });

    render(<Calendar />);

    await waitFor(() => {
      expect(getTeacherBookings).toHaveBeenCalledWith("teacher1");
    });
  });

  test("fetches and displays student bookings", async () => {
    // Explicitly set teacherData with uid
    useUser.mockReturnValue({
      user: { type: "student", uid: "student1" },
      selectedTeacher: "teacher1",
      teacherList: {
        teacher1: {
          ...mockTeacherData,
          uid: "teacher1", // Ensure teacherData has uid
        },
      },
      userLoading: false,
    });

    render(<Calendar />);

    await waitFor(() => {
      expect(getStudentBookings).toHaveBeenCalledWith("student1");
    });
  });

  test("displays booking overlay when slot is selected", () => {
    const mockSetShowBookingOverlay = vi.fn();
    useBooking.mockReturnValue({
      setSelectedSlot: vi.fn(),
      showBookingOverlay: true,
      setShowBookingOverlay: mockSetShowBookingOverlay,
      setFutureBookings: vi.fn(),
      bookings: mockBookings,
      setBookings: vi.fn(),
      bookingConfirmed: false,
      selectedSlot: {
        date: { year: 2024, month: 3, day: 15 },
        startTime: 9,
        endTime: 10,
        isRepeating: false,
        totalClasses: null,
        link: "https://meet.google.com/123",
      },
    });

    render(<Calendar />);
    expect(screen.getByRole("heading", { name: /confirm booking/i })).toBeInTheDocument();
  });

  test("handles availability updates for teachers", async () => {
    // Mock the availability update function
    const mockUpdateAvailability = vi.fn().mockResolvedValue(undefined);
    const mockAvailability = [
      {
        day: 1, // Changed to match component's expected format
        slots: [9], // Changed to match component's expected format
        key: "avail_0_9_10", // Added to match the event format
      },
    ];

    // Mock the current date
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 2, 25)); // Monday, March 25, 2024

    // Mock confirm
    const confirmSpy = vi.spyOn(window, "confirm");
    confirmSpy.mockImplementation(() => true);

    // Setup user context with teacher data
    useUser.mockReturnValue({
      user: {
        type: "teacher",
        uid: "teacher1",
        availability: mockAvailability,
      },
      selectedTeacher: null,
      teacherList: {},
      userLoading: false,
      updateAvailability: mockUpdateAvailability,
      currentAvailability: mockAvailability,
    });

    // Setup booking context
    useBooking.mockReturnValue({
      setSelectedSlot: vi.fn(),
      showBookingOverlay: false,
      setShowBookingOverlay: vi.fn(),
      setFutureBookings: vi.fn(),
      bookings: [],
      setBookings: vi.fn(),
      bookingConfirmed: false,
    });

    render(<Calendar />);

    // Wait for initial render and events state update
    await waitFor(
      () => {
        const timeSlot = screen.queryByTestId("time-slot-9");
        expect(timeSlot).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    // Get and click the time slot
    const timeSlot = screen.getByTestId("time-slot-9");
    fireEvent.click(timeSlot);

    // Verify confirm was called
    expect(confirmSpy).toHaveBeenCalled();

    // Wait for the updateAvailability function to be called
    await waitFor(
      () => {
        expect(mockUpdateAvailability).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );

    vi.useRealTimers();
    confirmSpy.mockRestore();
  }, 5000); // Increased overall timeout


  test("handles error state when fetching bookings fails", async () => {
    const mockShowError = vi.fn();
    useError.mockReturnValue({ showError: mockShowError });
    
    // Mock the service to reject immediately
    getStudentBookings.mockRejectedValueOnce(new Error("Failed to fetch"));
    
    // Mock user context
    useUser.mockReturnValue({
      user: { type: "student", uid: "student1" },
      selectedTeacher: "teacher1",
      teacherList: {},
      userLoading: false,
    });

    render(<Calendar />);

    // Wait for the error to be shown
    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Failed to fetch bookings');
    }, {
      timeout: 1000 // Reduce timeout since we expect this to happen quickly
    });
  });
});
