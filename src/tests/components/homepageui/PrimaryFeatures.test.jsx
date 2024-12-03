import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { PrimaryFeatures } from '@/components/homepageui/PrimaryFeatures';
import '@testing-library/jest-dom';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => ({
      'primaryFeatures.title': 'Everything you need to excel',
      'primaryFeatures.subtitle': 'Our platform provides all the tools',
      'primaryFeatures.features.findTutor.title': 'Find Your Perfect Tutor',
      'primaryFeatures.features.findTutor.description': 'Browse through our network',
      'primaryFeatures.features.schedule.title': 'Schedule Sessions',
      'primaryFeatures.features.schedule.description': 'Book sessions that fit',
      'primaryFeatures.features.interactive.title': 'Interactive Learning',
      'primaryFeatures.features.interactive.description': 'Engage in real-time',
      'primaryFeatures.features.progress.title': 'Track Progress',
      'primaryFeatures.features.progress.description': 'Monitor your growth'
    }[key] || key)
  })
}));

describe('PrimaryFeatures', () => {
  beforeEach(() => {
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
  });


  test('changes content when tab is clicked', () => {
    render(<PrimaryFeatures />);
    
    // Click each tab and verify its content is shown
    const tabs = [
      { title: 'Schedule Sessions', description: 'Book sessions that fit' },
      { title: 'Interactive Learning', description: 'Engage in real-time' },
      { title: 'Track Progress', description: 'Monitor your growth' }
    ];

    tabs.forEach(({ title, description }) => {
      const tab = screen.getByRole('tab', { name: title });
      fireEvent.click(tab);
      
      // Look specifically for the mobile view description (the one in the tab panel)
      const tabPanel = screen.getByRole('tabpanel');
      const panelText = within(tabPanel).getByText(description);
      expect(panelText).toBeInTheDocument();
    });
  });

  test('handles responsive layout changes', () => {
    const mockMatchMedia = window.matchMedia;
    
    // Test desktop layout (>= 1024px)
    mockMatchMedia.mockImplementation(query => ({
      matches: query === '(min-width: 1024px)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<PrimaryFeatures />);
    
    // In desktop view, tabs should be in a vertical layout
    const tabList = screen.getByRole('tablist');
    expect(tabList).toHaveClass('lg:block'); // Vertical layout class
    
    // Test mobile layout (< 1024px)
    mockMatchMedia.mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    // Trigger the media query change event
    const mediaQueryChange = new Event('change');
    window.matchMedia('(min-width: 1024px)').dispatchEvent(mediaQueryChange);
    
    // In mobile view, tabs should be in a horizontal layout
    expect(tabList).toHaveClass('flex'); // Horizontal layout class
  });

  test('applies correct styling classes', () => {
    render(<PrimaryFeatures />);
    
    // Check the main section container
    const section = screen.getByRole('region', { 
      name: /Features for finding the perfect tutor/i 
    });
    expect(section).toHaveClass(
      'relative',
      'overflow-hidden',
      'bg-green-600',
      'pb-28',
      'pt-20',
      'sm:py-32'
    );

    // Check the title heading
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveClass(
      'font-display',
      'text-3xl',
      'tracking-tight',
      'text-white',
      'sm:text-4xl',
      'md:text-5xl'
    );
  });
}); 