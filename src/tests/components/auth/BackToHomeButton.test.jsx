import React from "react";
import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import BackToHomeButton from "@/components/auth/BackToHomeButton";
import "@testing-library/jest-dom";


// Mock the next/link component
vi.mock("next/link", () => ({
  default: ({ children, href }) => <a href={href}>{children}</a>,
}));

// Mock the translation hook
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => (key === "signin.backToHome" ? "Back to Home" : key),
  }),
}));

describe("BackToHomeButton", () => {
  test("renders with correct link and text", () => {
    render(<BackToHomeButton />);

    // Query the DOM for an element with the role "link"
    const button = screen.getByRole("link", { name: /back to home/i });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("href", "/");
  });
});
