import React from "react";
import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BookingList from "@/components/manager/BookingList";
import { useBooking } from "@/components/providers";
import { ZoomService } from "@/services/zoom.service";
import "@testing-library/jest-dom";

// Mock the providers
vi.mock("@/components/providers", () => ({
  useBooking: vi.fn(),
}));

// Mock the ZoomService
vi.mock("@/services/zoom.service", () => ({
  ZoomService: {
    fetchArtifact: vi.fn(),
  },
}));

describe("BookingList", () => {
  const mockFutureBookings = [
    {
      id: "1",
      date: { year: 2024, month: 3, day: 15 },
      startTime: 9,
      endTime: 10,
      studentId: "student1",
      studentNickname: "John Doe",
      teacherId: "teacher1",
      link: "https://meet.google.com/123",
      meetingId: "meeting123",
      bulkId: "bulk1",
      lessonNumber: 1,
      totalLessons: 4,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mock for useBooking
    useBooking.mockReturnValue({
      futureBookings: mockFutureBookings,
    });
  });

  test("renders empty state when no bookings", () => {
    useBooking.mockReturnValue({
      futureBookings: [],
    });

    render(<BookingList />);
    expect(screen.getByText("Select a teacher to view their bookings")).toBeInTheDocument();
  });

  test("renders booking list with correct information", () => {
    render(<BookingList />);

    // Check date
    expect(screen.getByText("15/3/2024")).toBeInTheDocument();

    // Check time
    expect(screen.getByText("9:00 - 10:00")).toBeInTheDocument();

    // Check student info
    expect(screen.getByText("Student: John Doe")).toBeInTheDocument();

    // Check bulk booking info
    expect(screen.getByText("Lesson 1 of 4")).toBeInTheDocument();

    // Check buttons
    expect(screen.getByText("Fetch Recording")).toBeInTheDocument();
    expect(screen.getByText("Join Meeting")).toBeInTheDocument();
  });

  test("handles fetch artifacts button click", async () => {
    const mockArtifacts = {
      recording_files: [{ recording_type: "video", download_url: "http://example.com/recording" }],
    };
    ZoomService.fetchArtifact.mockResolvedValueOnce(mockArtifacts);

    render(<BookingList />);

    const fetchButton = screen.getByText("Fetch Recording");
    await fireEvent.click(fetchButton);

    expect(ZoomService.fetchArtifact).toHaveBeenCalledWith("meeting123");
  });

  test("handles fetch artifacts error", async () => {
    // Mock console.error to prevent error output in tests
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    ZoomService.fetchArtifact.mockRejectedValueOnce(new Error("Failed to fetch"));

    render(<BookingList />);

    const fetchButton = screen.getByText("Fetch Recording");
    await fireEvent.click(fetchButton);

    expect(consoleSpy).toHaveBeenCalledWith("Failed to fetch artifacts:", expect.any(Error));

    consoleSpy.mockRestore();
  });

  test("renders meeting link correctly", () => {
    render(<BookingList />);

    const meetingLink = screen.getByText("Join Meeting");
    expect(meetingLink).toHaveAttribute("href", "https://meet.google.com/123");
    expect(meetingLink).toHaveAttribute("target", "_blank");
    expect(meetingLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("conditionally renders fetch recording button", () => {
    // Render with booking that has no meetingId
    useBooking.mockReturnValue({
      futureBookings: [
        {
          ...mockFutureBookings[0],
          meetingId: null,
        },
      ],
    });

    render(<BookingList />);

    expect(screen.queryByText("Fetch Recording")).not.toBeInTheDocument();
  });

  test("applies correct styling classes", () => {
    render(<BookingList />);

    // Check main container
    expect(screen.getByTestId("bookings-container")).toHaveClass("p-4", "md:p-6", "space-y-4");

    // Check booking card
    expect(screen.getByTestId("booking-card")).toHaveClass("bg-white", "rounded-lg", "shadow", "p-4", "md:p-6");
  });
});
