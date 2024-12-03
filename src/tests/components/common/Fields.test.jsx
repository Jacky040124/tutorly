import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextField, SelectField, InputField, ToggleField } from '@/components/common/Fields';
import '@testing-library/jest-dom';

describe('Fields Components', () => {
  describe('TextField', () => {
    test('renders with label', () => {
      render(<TextField label="Test Label" />);
      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    });

    test('applies correct classes', () => {
      render(<TextField label="Test" />);
      expect(screen.getByLabelText('Test')).toHaveClass('bg-white', 'border', 'border-slate-300', 'rounded-md', 'py-2', 'px-3', 'text-sm', 'leading-6', 'font-normal', 'text-gray-900', 'placeholder:text-gray-400', 'focus:ring-indigo-600', 'focus:border-indigo-600', 'w-full');
    });
  });

  describe('SelectField', () => {
    test('renders with label', () => {
      render(<SelectField label="Test Label" />);
      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    });

    test('applies correct classes', () => {
      render(<SelectField label="Test" />);
      expect(screen.getByLabelText('Test')).toHaveClass('bg-white', 'border', 'border-slate-300', 'rounded-md', 'py-2', 'px-3', 'text-sm', 'leading-6', 'font-normal', 'text-gray-900', 'placeholder:text-gray-400', 'focus:ring-indigo-600', 'focus:border-indigo-600', 'w-full');
    });
  });

  describe('InputField', () => {
    test('renders with label', () => {
      render(<InputField label="Test Label" />);
      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    });

    test('applies correct classes', () => {
      render(<InputField label="Test" />);
      expect(screen.getByLabelText('Test')).toHaveClass('bg-white', 'border', 'border-slate-300', 'rounded-md', 'py-2', 'px-3', 'text-sm', 'leading-6', 'font-normal', 'text-gray-900', 'placeholder:text-gray-400', 'focus:ring-indigo-600', 'focus:border-indigo-600', 'w-full');
    });
  });

  describe('ToggleField', () => {
    test('renders with label', () => {
      render(<ToggleField label="Test Label" />);
      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    });

    test('applies correct classes', () => {
      render(<ToggleField label="Test" />);
      expect(screen.getByLabelText('Test')).toHaveClass('bg-white', 'border', 'border-slate-300', 'rounded-md', 'py-2', 'px-3', 'text-sm', 'leading-6', 'font-normal', 'text-gray-900', 'placeholder:text-gray-400', 'focus:ring-indigo-600', 'focus:border-indigo-600', 'w-full');
    });
  });
}); 