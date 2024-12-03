import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Testimonials } from '@/components/homepageui/Testimonials';
import '@testing-library/jest-dom';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt }) => <img src={src} alt={alt} />
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => ({
      'testimonials.title': 'Trusted by students worldwide',
      'testimonials.subtitle': 'Our platform has helped thousands'
    }[key] || key)
  })
}));

describe('Testimonials', () => {
  test('renders section title and subtitle', () => {
    render(<Testimonials />);
    
    expect(screen.getByText('Trusted by students worldwide')).toBeInTheDocument();
    expect(screen.getByText('Our platform has helped thousands')).toBeInTheDocument();
  });

  test('renders all testimonial cards', () => {
    render(<Testimonials />);
    
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
    expect(screen.getByText('Michael Rodriguez')).toBeInTheDocument();
    expect(screen.getByText('Emily Watson')).toBeInTheDocument();
    expect(screen.getByText('David Kim')).toBeInTheDocument();
  });

  test('renders testimonial content and roles', () => {
    render(<Testimonials />);
    
    expect(screen.getByText('Computer Science Student')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText(/The tutoring platform helped/i)).toBeInTheDocument();
  });
}); 