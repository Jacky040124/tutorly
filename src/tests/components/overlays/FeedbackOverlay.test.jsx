import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FeedbackOverlay from "@/components/overlays/FeedbackOverlay";
import { useUser, useError } from "@/components/providers";
import { addFeedback, updateFeedback, deleteFeedback } from "@/services/booking.service";
import "@testing-library/jest-dom";
import { UserProvider } from "@/components/providers/UserContext";
import { ErrorProvider } from "@/components/providers/ErrorContext";
import { act } from '@testing-library/react';

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

// Create a wrapper component for your tests
const TestWrapper = ({ children }) => {
  return (
    <UserProvider>
      <ErrorProvider>{children}</ErrorProvider>
    </UserProvider>
  );
};

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

  beforeEach(async () => {
    vi.clearAllMocks();

    await act(async () => {
      useUser.mockReturnValue({
        user: { uid: "student1" },
      });

      useError.mockReturnValue({
        showError: vi.fn(),
      });
    });
  });

  test("renders add feedback form correctly", () => {
    render(
      <TestWrapper>
        <FeedbackOverlay {...mockProps} />
      </TestWrapper>
    );

    expect(screen.getByText("Add Feedback")).toBeInTheDocument();
  });

  test("renders edit feedback form with existing data", () => {
    const bookingWithFeedback = {
      ...mockBooking,
      feedback: {
        rating: 4,
        comment: "Great lesson!",
      },
    };

    render(
      <TestWrapper>
        <FeedbackOverlay {...mockProps} booking={bookingWithFeedback} />
      </TestWrapper>
    );

    // Check for edit mode title
    expect(screen.getByText("Edit Feedback")).toBeInTheDocument();

    // Check for correct number of highlighted stars
    const highlightedStars = screen
      .getAllByRole("button")
      .filter((button) => button.textContent === "★" && button.className.includes("text-yellow-400"));
    expect(highlightedStars).toHaveLength(4);

    // Check for existing comment
    expect(screen.getByDisplayValue("Great lesson!")).toBeInTheDocument();

    // Verify edit mode button text
    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
  });

  test("handles rating selection", () => {
    render(
      <TestWrapper>
        <FeedbackOverlay {...mockProps} />
      </TestWrapper>
    );

    const ratingButtons = screen.getAllByRole("button").slice(0, 5); // First 5 buttons are rating stars
    fireEvent.click(ratingButtons[3]); // Select 4 stars

    expect(ratingButtons[3]).toHaveClass("text-yellow-400");
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

    render(
      <TestWrapper>
        <FeedbackOverlay {...mockProps} booking={bookingWithFeedback} />
      </TestWrapper>
    );

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

    render(
      <TestWrapper>
        <FeedbackOverlay {...mockProps} booking={bookingWithFeedback} />
      </TestWrapper>
    );

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

    render(
      <TestWrapper>
        <FeedbackOverlay {...mockProps} />
      </TestWrapper>
    );

    const submitButton = screen.getByRole("button", { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(mockError.message);
    });
  });
});
