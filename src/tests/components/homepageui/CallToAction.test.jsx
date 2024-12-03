import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CallToAction } from '@/components/homepageui/CallToAction';
import '@testing-library/jest-dom';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => ({
      'callToAction.title': 'Start your learning journey today',
      'callToAction.subtitle': 'Join thousands of students',
      'callToAction.button': 'Get started'
    }[key] || key)
  })
}));

describe('CallToAction', () => {
  test('renders all text content', () => {
    render(<CallToAction />);
    
    expect(screen.getByText('Start your learning journey today')).toBeInTheDocument();
    expect(screen.getByText('Join thousands of students')).toBeInTheDocument();
    expect(screen.getByText('Get started')).toBeInTheDocument();
  });

  test('button links to signup', () => {
    render(<CallToAction />);
    const button = screen.getByText('Get started').closest('a');
    expect(button).toHaveAttribute('href', '/auth/signup');
  });
}); 