import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PrimaryFeatures } from '@/components/homepageui/PrimaryFeatures';
import '@testing-library/jest-dom';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => ({
      'primaryFeatures.title': 'Everything you need to excel',
      'primaryFeatures.subtitle': 'Our platform provides all the tools',
      'primaryFeatures.features.findTutor.title': 'Find Your Perfect Tutor',
      'primaryFeatures.features.findTutor.description': 'Browse through our network',
      'primaryFeatures.features.schedule.title': 'Schedule Sessions',
      'primaryFeatures.features.schedule.description': 'Book sessions that fit',
    }[key] || key)
  })
}));

describe('PrimaryFeatures', () => {
  test('renders section title and subtitle', () => {
    render(<PrimaryFeatures />);
    
    expect(screen.getByText('Everything you need to excel')).toBeInTheDocument();
    expect(screen.getByText('Our platform provides all the tools')).toBeInTheDocument();
  });

  test('renders all feature tabs', () => {
    render(<PrimaryFeatures />);
    
    expect(screen.getByText('Find Your Perfect Tutor')).toBeInTheDocument();
    expect(screen.getByText('Schedule Sessions')).toBeInTheDocument();
  });

  test('changes content when tab is clicked', () => {
    render(<PrimaryFeatures />);
    
    const scheduleTab = screen.getByText('Schedule Sessions');
    fireEvent.click(scheduleTab);
    
    expect(screen.getByText('Book sessions that fit')).toBeInTheDocument();
  });

  test('handles responsive layout changes', () => {
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(<PrimaryFeatures />);
    // Verify initial horizontal layout
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });
}); 