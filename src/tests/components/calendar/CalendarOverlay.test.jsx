import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CalendarOverlay from "@/components/calendar/CalendarOverlay";
import { useUser, useError, useOverlay } from "@/components/providers";
import { ZoomService } from "@/services/zoom.service";
import "@testing-library/jest-dom";

// Mock the providers
vi.mock("@/components/providers", () => ({
  useUser: vi.fn(),
  useError: vi.fn(),
  useOverlay: vi.fn(),
}));

// Mock the ZoomService
vi.mock("@/services/zoom.service", () => ({
  ZoomService: {
    createMeeting: vi.fn(),
  },
}));

describe("CalendarOverlay", () => {
  const mockUser = {
    uid: "teacher1",
    type: "teacher",
  };

  const mockAvailability = [];

  beforeEach(() => {
    vi.clearAllMocks();

    useUser.mockReturnValue({
      user: mockUser,
      availability: mockAvailability,
      updateAvailability: vi.fn(),
    });

    useError.mockReturnValue({
      error: null,
      showError: vi.fn(),
    });

    useOverlay.mockReturnValue({
      setShowCalendarOverlay: vi.fn(),
    });

    ZoomService.createMeeting.mockResolvedValue({
      link: "https://zoom.us/test",
    });
  });

  test("renders calendar overlay with all fields", () => {
    render(<CalendarOverlay />);

    expect(screen.getByText("New Event")).toBeInTheDocument();
    expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end time/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  test("validates required fields", async () => {
    const mockShowError = vi.fn();
    useError.mockReturnValue({
      error: null,
      showError: mockShowError,
    });

    render(<CalendarOverlay />);

    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    expect(mockShowError).toHaveBeenCalledWith("Please fill in all fields");
  });

  test("validates time range", async () => {
    const mockShowError = vi.fn();
    useError.mockReturnValue({
      error: null,
      showError: mockShowError
    });

    render(<CalendarOverlay />);

    // 1. Set the date first
    const dateButton = screen.getByRole('button', { name: /select day/i });
    fireEvent.click(dateButton);
    
    // Mock the date selection callback
    const datePicker = screen.getByRole('button', { name: /select day/i }).parentElement;
    const mockDate = {
      day: 20,
      month: 3,
      year: 2024,
      displayText: 'Wednesday, Mar 20'
    };
    
    // Find the DatePicker and trigger date selection
    const datePickerInstance = datePicker.querySelector('.react-datepicker');
    fireEvent.click(datePickerInstance);
    
    // 2. Set the times using select elements
    const startTimeSelect = screen.getByLabelText(/start time/i);
    const endTimeSelect = screen.getByLabelText(/end time/i);

    // Set invalid time range
    fireEvent.change(startTimeSelect, { target: { value: '10:00' } });
    fireEvent.change(endTimeSelect, { target: { value: '09:00' } });

    // Click save
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    // Verify error message
    expect(mockShowError).toHaveBeenCalledWith('End time must be later than start time');
  });

  test("handles successful event creation with Zoom meeting", async () => {
    const mockUpdateAvailability = vi.fn();
    useUser.mockReturnValue({
      user: mockUser,
      availability: mockAvailability,
      updateAvailability: mockUpdateAvailability,
    });

    render(<CalendarOverlay />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/start time/i), { target: { value: "09:00" } });
    fireEvent.change(screen.getByLabelText(/end time/i), { target: { value: "10:00" } });

    // Mock date selection
    const dateInput = screen.getByLabelText(/date/i);
    fireEvent.change(dateInput, { target: { value: "2024-03-20" } });

    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(ZoomService.createMeeting).toHaveBeenCalled();
      expect(mockUpdateAvailability).toHaveBeenCalled();
    });
  });
});
