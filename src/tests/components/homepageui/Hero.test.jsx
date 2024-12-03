import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from '@/components/homepageui/Hero';
import '@testing-library/jest-dom';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt }) => <img src={src} alt={alt} />
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => ({
      'hero.buttons.start': 'Start Learning Today',
      'hero.buttons.howItWorks': 'How it works'
    }[key] || key)
  })
}));

describe('Hero', () => {
  test('renders action buttons with correct links', () => {
    render(<Hero />);
    
    // Check signup button
    const signupButton = screen.getByRole('link', { name: /start learning today/i });
    expect(signupButton).toBeInTheDocument();
    expect(signupButton).toHaveAttribute('href', '/auth/signup');

    // Check how it works button
    const howItWorksButton = screen.getByRole('link', { name: /how it works/i });
    expect(howItWorksButton).toBeInTheDocument();
    expect(howItWorksButton).toHaveAttribute("href", "#how-it-works");
  });
});
