import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { SecondaryFeatures } from '@/components/homepageui/SecondaryFeatures';
import '@testing-library/jest-dom';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt }) => <img src={src} alt={alt} />
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => ({
      'secondaryFeatures.title': 'Everything you need for effective learning',
      'secondaryFeatures.subtitle': 'Our platform provides all the tools',
      'secondaryFeatures.features.matching.name': 'Smart Matching',
      'secondaryFeatures.features.matching.summary': 'AI-powered system',
      'secondaryFeatures.features.matching.description': 'Our AI-driven system matches you with the perfect tutor',
      'secondaryFeatures.features.classroom.name': 'Virtual Classroom',
      'secondaryFeatures.features.classroom.summary': 'Interactive online learning',
      'secondaryFeatures.features.classroom.description': 'Engage in real-time virtual sessions',
      'secondaryFeatures.features.progress.name': 'Progress Tracking',
      'secondaryFeatures.features.progress.summary': 'Monitor your learning journey',
      'secondaryFeatures.features.progress.description': 'Track your progress with detailed analytics'
    }[key] || key)
  })
}));

describe('SecondaryFeatures', () => {

  test('renders all feature cards', () => {
    render(<SecondaryFeatures />);
    
    expect(screen.getByText('Smart Matching')).toBeInTheDocument();
    expect(screen.getByText('Virtual Classroom')).toBeInTheDocument();
  });

  test('shows feature details when selected', () => {
    render(<SecondaryFeatures />);
    
    // Find and click the first tab
    const tabs = screen.getAllByRole('tab');
    const firstTab = tabs[0];
    fireEvent.click(firstTab);
    
    // Find the corresponding panel
    const panels = screen.getAllByRole('tabpanel');
    const activePanel = panels[0];
    
    // Verify the selected feature's details are shown
    expect(activePanel).toBeVisible();
    
    // Verify the image is shown for the selected feature
    const featureImage = within(activePanel).getByRole('img');
    expect(featureImage).toBeVisible();
  });

  test('renders feature images', () => {
    render(<SecondaryFeatures />);
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });
}); 