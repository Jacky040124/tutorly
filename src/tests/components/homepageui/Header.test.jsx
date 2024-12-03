import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '@/components/homepageui/Header';
import '@testing-library/jest-dom';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, 'aria-label': ariaLabel, ...props }) => (
    <a href={href} aria-label={ariaLabel} {...props}>
      {children}
    </a>
  ),
}));

// Mock the Logo component
vi.mock('@/components/common/Logo', () => ({
  Logo: () => <div data-testid="logo">Logo</div>
}));

// Mock LanguageSwitcher
vi.mock('@/components/common/LanguageSwitcher', () => ({
  default: () => <div data-testid="language-switcher">Language Switcher</div>
}));

describe('Header', () => {
  test('renders logo with home link', () => {
    render(<Header />);
    
    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  test('renders main navigation links', () => {
    render(<Header />);
    
    const navigationLinks = [
      { name: 'Features', href: '#features' },
      { name: 'Testimonials', href: '#testimonials' },
      { name: 'Pricing', href: '#pricing' }
    ];

    navigationLinks.forEach(link => {
      const element = screen.getByRole('link', { name: link.name });
      expect(element).toBeInTheDocument();
      expect(element).toHaveAttribute('href', link.href);
    });
  });

  test('renders auth links', () => {
    render(<Header />);
    
    // Sign in link
    const signInLink = screen.getByRole('link', { name: /sign in/i });
    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveAttribute('href', '/auth/signin');

    // Sign up button
    const signUpButton = screen.getByRole('link', { name: /get started/i });
    expect(signUpButton).toBeInTheDocument();
    expect(signUpButton).toHaveAttribute('href', '/auth/signup');
  });

  test('renders language switcher', () => {
    render(<Header />);
    expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
  });

  test('applies correct responsive classes', () => {
    render(<Header />);
    
    // Main nav should be hidden on mobile
    const mainNav = screen.getByRole('navigation').querySelector('.hidden.md\\:flex');
    expect(mainNav).toBeInTheDocument();
    
    // Sign in link should be hidden
  });
}); 