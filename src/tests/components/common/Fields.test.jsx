import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextField, SelectField, InputField, ToggleField } from '@/components/common/Fields';
import '@testing-library/jest-dom';

describe('Fields Components', () => {
  describe('TextField', () => {
    test('handles value changes', () => {
      const handleChange = vi.fn();
      render(<TextField label="Test" onChange={handleChange} />);
      
      const input = screen.getByLabelText('Test');
      fireEvent.change(input, { target: { value: 'new value' } });
      
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('SelectField', () => {
    test('handles selection changes', () => {
      const handleChange = vi.fn();
      render(
        <SelectField 
          label="Test" 
          onChange={handleChange}
        >
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
        </SelectField>
      );
      
      const select = screen.getByLabelText('Test');
      fireEvent.change(select, { target: { value: '2' } });
      
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('InputField', () => {
    test('handles time selection', () => {
      const handleChange = vi.fn();
      render(<InputField 
        name="Test Time" 
        onChange={handleChange}
      />);
      
      // Get the select element by its name
      const select = screen.getByLabelText('Test Time');
      
      // Change to a time option
      fireEvent.change(select, { target: { value: '09:00' } });
      
      expect(handleChange).toHaveBeenCalled();
    });

    test('generates correct time options', () => {
      render(<InputField name="Test Time" />);
      
      const select = screen.getByLabelText('Test Time');
      const options = Array.from(select.children);
      
      // Check default option
      expect(options[0]).toHaveTextContent('Select Time');
      
      // Check time options (6:00 to 23:30, with 30-minute intervals)
      expect(options).toHaveLength(37); // 1 default + (18 hours * 2 intervals)
      expect(options[1]).toHaveTextContent('06:00');
      expect(options[2]).toHaveTextContent('06:30');
      expect(options[options.length - 2]).toHaveTextContent('23:00');
      expect(options[options.length - 1]).toHaveTextContent('23:30');
    });
  });

  describe('ToggleField', () => {
    test('handles toggle state changes', () => {
      const handleChange = vi.fn();
      render(<ToggleField name="Test" onChange={handleChange} value={false} />);
      
      const toggle = screen.getByRole('switch');
      fireEvent.click(toggle);
      
      expect(handleChange).toHaveBeenCalled();
    });

    test('reflects current value state', () => {
      render(<ToggleField name="Test" value={true} />);
      
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });
  });
}); 