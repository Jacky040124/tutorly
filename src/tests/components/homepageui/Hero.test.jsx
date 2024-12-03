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
      'hero.title.part1': 'Find the perfect',
      'hero.title.part2': 'tutor',
      'hero.title.part3': 'for your learning journey',
      'hero.subtitle': 'Connect with expert tutors',
      'hero.buttons.start': 'Start Learning Today',
      'hero.buttons.howItWorks': 'How it works',
      'hero.trusted': 'Trusted by students'
    }[key] || key)
  })
}));

describe('Hero', () => {
  test('renders all main sections', () => {
    render(<Hero />);
    
    // Check title parts
    expect(screen.getByText('Find the perfect')).toBeInTheDocument();
    expect(screen.getByText('tutor')).toBeInTheDocument();
    expect(screen.getByText('for your learning journey')).toBeInTheDocument();
    
    // Check buttons
    expect(screen.getByText('Start Learning Today')).toBeInTheDocument();
    expect(screen.getByText('How it works')).toBeInTheDocument();
    
    // Check trusted section
    expect(screen.getByText('Trusted by students')).toBeInTheDocument();
  });

  test('renders university logos', () => {
    render(<Hero />);
    const logos = screen.getAllBy
  });
}); 