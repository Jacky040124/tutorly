import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StudentProfileOverlay from '@/components/overlays/StudentProfileOverlay';
import { useUser, useError, useOverlay } from '@/components/providers';
import '@testing-library/jest-dom';

// Mock the providers
vi.mock('@/components/providers', () => ({
  useUser: vi.fn(),
  useError: vi.fn(),
  useOverlay: vi.fn(),
}));

describe('StudentProfileOverlay', () => {
  const mockUser = {
    academicDetails: {
      gradeLevel: '12th Grade',
      description: 'Test Academic Description'
    }
  };

  const mockUpdateFns = {
    updateGradeLevel: vi.fn(),
    updateStudentDescription: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    useUser.mockReturnValue({
      user: mockUser,
      ...mockUpdateFns
    });

    useError.mockReturnValue({
      showError: vi.fn()
    });

    useOverlay.mockReturnValue({
      setShowStudentProfileOverlay: vi.fn()
    });
  });

  test('renders with initial academic details', () => {
    render(<StudentProfileOverlay />);
    
    expect(screen.getByLabelText(/grade level/i)).toHaveValue('12th Grade');
    expect(screen.getByLabelText(/description/i)).toHaveValue('Test Academic Description');
  });

  test('handles input changes', () => {
    render(<StudentProfileOverlay />);
    
    const gradeLevelInput = screen.getByLabelText(/grade level/i);
    const descriptionInput = screen.getByLabelText(/description/i);

    fireEvent.change(gradeLevelInput, { target: { value: '11th Grade' } });
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } });

    expect(gradeLevelInput).toHaveValue('11th Grade');
    expect(descriptionInput).toHaveValue('New Description');
  });

  test('handles successful save', async () => {
    const mockSetShowStudentProfileOverlay = vi.fn();
    useOverlay.mockReturnValue({
      setShowStudentProfileOverlay: mockSetShowStudentProfileOverlay
    });

    render(<StudentProfileOverlay />);
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    await fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateFns.updateGradeLevel).toHaveBeenCalled();
      expect(mockUpdateFns.updateStudentDescription).toHaveBeenCalled();
      expect(mockSetShowStudentProfileOverlay).toHaveBeenCalledWith(false);
    });
  });

  test('handles save error', async () => {
    const mockShowError = vi.fn();
    useError.mockReturnValue({
      showError: mockShowError
    });

    const mockError = new Error('Update failed');
    mockUpdateFns.updateGradeLevel.mockRejectedValue(mockError);

    render(<StudentProfileOverlay />);
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    await fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Failed to update profile: Update failed');
    });
  });

  test('handles cancel', () => {
    const mockSetShowStudentProfileOverlay = vi.fn();
    useOverlay.mockReturnValue({
      setShowStudentProfileOverlay: mockSetShowStudentProfileOverlay
    });

    render(<StudentProfileOverlay />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockSetShowStudentProfileOverlay).toHaveBeenCalledWith(false);
  });
}); 