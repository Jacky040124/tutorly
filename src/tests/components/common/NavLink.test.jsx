import React from 'react';
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NavLink } from '@/components/common/NavLink';
import '@testing-library/jest-dom';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, ...props }) => <a {...props}>{children}</a>,
}));

describe('NavLink', () => {
  test('renders link with correct props', () => {
    render(<NavLink href="/test">Test Link</NavLink>);
    
    const link = screen.getByText('Test Link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });

  test('applies correct default styling', () => {
    render(<NavLink href="/test">Test Link</NavLink>);
    
    const link = screen.getByText('Test Link');
    expect(link).toHaveClass(
      'inline-block',
      'rounded-lg',
      'px-2',
      'py-1',
      'text-sm'
    );
  });
}); 