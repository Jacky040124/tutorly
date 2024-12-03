import React from "react";
import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DayField from "@/components/calendar/DayField";
import "@testing-library/jest-dom";

describe("DayField", () => {
  const mockOnChange = vi.fn();

  test("renders select day button", () => {
    render(<DayField value={null} onChange={mockOnChange} />);
    expect(screen.getByText("Select day")).toBeInTheDocument();
  });

  test("opens calendar on button click", () => {
    render(<DayField value={null} onChange={mockOnChange} />);
    const button = screen.getByText("Select day");
    fireEvent.click(button);
    expect(screen.getByRole("dialog", { name: "Choose Date" })).toBeInTheDocument();
  });

  test("displays selected date", () => {
    const selectedDate = {
      year: 2024,
      month: 3,
      day: 20,
      displayText: "Wednesday, Mar 20"
    };

    render(<DayField value={selectedDate} onChange={mockOnChange} />);
    expect(screen.getByText("Wednesday, Mar 20")).toBeInTheDocument();
  });

  // Note: Testing date selection would require more complex interaction with the DatePicker
  // component, which might need additional setup or mocking
});
