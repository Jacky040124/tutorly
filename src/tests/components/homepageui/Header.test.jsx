import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => ({
      'nav.features': 'Features',
      'nav.testimonials': 'Testimonials',
      'nav.pricing': 'Pricing',
      'nav.signin': 'Sign in',
      'nav.getStarted': 'Get started',
      'nav.today': 'today'
    }[key] || key)
  })
}));

describe('Header', () => {
  test('renders logo with home link', () => {
    render(<Header />);
    
    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  test('renders desktop navigation links', () => {
    render(<Header />);
    
    // Check if the navigation container exists with correct classes
    const desktopNav = screen.getByRole('navigation');
    expect(desktopNav).toHaveClass('relative', 'z-50', 'flex', 'justify-between');
    
    // Check for individual nav links in desktop view
    const featuresLink = screen.getByRole('link', { name: /features/i });
    const testimonialsLink = screen.getByRole('link', { name: /testimonials/i });
    const pricingLink = screen.getByRole('link', { name: /pricing/i });

    expect(featuresLink).toHaveAttribute('href', '#features');
    expect(testimonialsLink).toHaveAttribute('href', '#testimonials');
    expect(pricingLink).toHaveAttribute('href', '#pricing');
  });

  test('renders mobile navigation when menu button is clicked', () => {
    render(<Header />);
    
    // Find and click the mobile menu button
    const menuButton = screen.getByRole('button', { name: /toggle navigation/i });
    fireEvent.click(menuButton);

    // Check if mobile menu items are displayed
    const mobileNav = screen.getByRole('navigation');
    expect(mobileNav).toBeInTheDocument();
  });

  test('renders auth buttons', () => {
    render(<Header />);
    
    // Check for sign in link
    const signInLink = screen.getByRole('link', { name: /sign in/i });
    expect(signInLink).toHaveAttribute('href', '/auth/signin');

    // Check for get started button
    const getStartedButton = screen.getByRole('link', { name: /get started/i });
    expect(getStartedButton).toHaveAttribute('href', '/auth/signup');
  });

  test('renders language switcher', () => {
    render(<Header />);
    expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
  });

  test('applies correct responsive classes', () => {
    render(<Header />);
    
    // Check if desktop navigation is hidden on mobile
    const desktopLinks = screen.getByRole('navigation')
      .querySelector('.hidden.md\\:flex.md\\:gap-x-6');
    expect(desktopLinks).toBeInTheDocument();

    // Check if mobile menu button has correct classes
    const mobileMenuButton = screen.getByRole('button', { name: /toggle navigation/i });
    expect(mobileMenuButton).toHaveClass(
      'relative',
      'z-10',
      'flex',
      'h-8',
      'w-8',
      'items-center',
      'justify-center'
    );
  });
}); 