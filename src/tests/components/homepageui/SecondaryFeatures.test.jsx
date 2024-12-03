import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
      'secondaryFeatures.features.classroom.name': 'Virtual Classroom',
      'secondaryFeatures.features.classroom.summary': 'Interactive online learning'
    }[key] || key)
  })
}));

describe('SecondaryFeatures', () => {
  test('renders section title and subtitle', () => {
    render(<SecondaryFeatures />);
    
    expect(screen.getByText('Everything you need for effective learning')).toBeInTheDocument();
    expect(screen.getByText('Our platform provides all the tools')).toBeInTheDocument();
  });

  test('renders all feature cards', () => {
    render(<SecondaryFeatures />);
    
    expect(screen.getByText('Smart Matching')).toBeInTheDocument();
    expect(screen.getByText('Virtual Classroom')).toBeInTheDocument();
  });

  test('shows feature details when selected', () => {
    render(<SecondaryFeatures />);
    
    const matchingFeature = screen.getByText('Smart Matching');
    fireEvent.click(matchingFeature);
    
    expect(screen.getByText('AI-powered system')).toBeInTheDocument();
  });

  test('renders feature images', () => {
    render(<SecondaryFeatures />);
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });
}); 