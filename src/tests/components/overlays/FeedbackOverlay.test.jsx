import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FeedbackOverlay from "@/components/overlays/FeedbackOverlay";
import { useUser, useError } from "@/components/providers";
import { addFeedback, updateFeedback, deleteFeedback } from "@/services/booking.service";
import "@testing-library/jest-dom";

// Mock the providers and services
vi.mock("@/components/providers", () => ({
  useUser: vi.fn(),
  useError: vi.fn(),
}));

vi.mock("@/services/booking.service", () => ({
  addFeedback: vi.fn(),
  updateFeedback: vi.fn(),
  deleteFeedback: vi.fn(),
}));

describe("FeedbackOverlay", () => {
  const mockBooking = {
    id: "booking123",
    feedback: null,
  };

  const mockProps = {
    booking: mockBooking,
    onClose: vi.fn(),
    onFeedbackSubmitted: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    useUser.mockReturnValue({
      user: { uid: "student1" },
    });

    useError.mockReturnValue({
      showError: vi.fn(),
    });
  });

  test("renders add feedback form correctly", () => {
    render(<FeedbackOverlay {...mockProps} />);

    expect(screen.getByText("Add Feedback")).toBeInTheDocument();
    expect(screen.getByLabelText(/rating/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/comment/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  test("renders edit feedback form with existing data", () => {
    const bookingWithFeedback = {
      ...mockBooking,
      feedback: {
        rating: 4,
        comment: "Great lesson!",
      },
    };

    render(<FeedbackOverlay {...mockProps} booking={bookingWithFeedback} />);

    expect(screen.getByText("Edit Feedback")).toBeInTheDocument();
    expect(screen.getByText("★★★★")).toHaveClass("text-yellow-400");
    expect(screen.getByDisplayValue("Great lesson!")).toBeInTheDocument();
  });

  test("handles rating selection", () => {
    render(<FeedbackOverlay {...mockProps} />);

    const ratingButtons = screen.getAllByRole("button").slice(0, 5); // First 5 buttons are rating stars
    fireEvent.click(ratingButtons[3]); // Select 4 stars

    expect(ratingButtons[3]).toHaveClass("text-yellow-400");
  });

  test("handles successful feedback submission", async () => {
    addFeedback.mockResolvedValueOnce();

    render(<FeedbackOverlay {...mockProps} />);

    const ratingButton = screen.getAllByRole("button")[3]; // 4 stars
    const commentInput = screen.getByLabelText(/comment/i);
    const submitButton = screen.getByRole("button", { name: /submit/i });

    fireEvent.click(ratingButton);
    fireEvent.change(commentInput, { target: { value: "Great lesson!" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(addFeedback).toHaveBeenCalledWith(mockBooking.id, {
        rating: 4,
        comment: "Great lesson!",
        studentId: "student1",
        meetingId: mockBooking.id,
      });
      expect(mockProps.onFeedbackSubmitted).toHaveBeenCalled();
      expect(mockProps.onClose).toHaveBeenCalled();
    });
  });

  test("handles feedback update", async () => {
    updateFeedback.mockResolvedValueOnce();

    const bookingWithFeedback = {
      ...mockBooking,
      feedback: {
        rating: 3,
        comment: "Good lesson",
      },
    };

    render(<FeedbackOverlay {...mockProps} booking={bookingWithFeedback} />);

    const commentInput = screen.getByLabelText(/comment/i);
    fireEvent.change(commentInput, { target: { value: "Updated comment" } });

    const submitButton = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(updateFeedback).toHaveBeenCalled();
    });
  });

  test("handles feedback deletion", async () => {
    deleteFeedback.mockResolvedValueOnce();

    const bookingWithFeedback = {
      ...mockBooking,
      feedback: {
        rating: 3,
        comment: "Good lesson",
      },
    };

    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, "confirm");
    confirmSpy.mockImplementation(() => true);

    render(<FeedbackOverlay {...mockProps} booking={bookingWithFeedback} />);

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteFeedback).toHaveBeenCalledWith(mockBooking.id);
      expect(mockProps.onFeedbackSubmitted).toHaveBeenCalled();
      expect(mockProps.onClose).toHaveBeenCalled();
    });

    confirmSpy.mockRestore();
  });

  test("handles submission error", async () => {
    const mockShowError = vi.fn();
    useError.mockReturnValue({
      showError: mockShowError,
    });

    const mockError = new Error("Submission failed");
    addFeedback.mockRejectedValueOnce(mockError);

    render(<FeedbackOverlay {...mockProps} />);

    const submitButton = screen.getByRole("button", { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(mockError.message);
    });
  });
});
