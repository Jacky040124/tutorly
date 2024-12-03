import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import HomeworkLinkOverlay from '@/components/overlays/HomeworkLinkOverlay';
import { doc, setDoc } from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  getFirestore: vi.fn()
}));

// Mock the entire firebase config module
vi.mock('@/lib/firebase', () => ({
  db: vi.fn(),
  auth: vi.fn()
}));

describe('HomeworkLinkOverlay', () => {
  const mockBooking = {
    id: 'test-booking-id',
    homeworkLink: ''
  };
  
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with initial empty link', () => {
    render(
      <HomeworkLinkOverlay 
        booking={mockBooking} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
      />
    );

    expect(screen.getByText('Add Homework Link')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://drive.google.com/...')).toHaveValue('');
  });

  it('renders correctly with existing homework link', () => {
    const bookingWithLink = {
      ...mockBooking,
      homeworkLink: 'https://drive.google.com/existing'
    };

    render(
      <HomeworkLinkOverlay 
        booking={bookingWithLink} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
      />
    );

    expect(screen.getByText('Update Homework Link')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://drive.google.com/...')).toHaveValue('https://drive.google.com/existing');
  });

  it('validates Google Drive link', async () => {
    const { getByPlaceholderText } = render(
      <HomeworkLinkOverlay 
        booking={mockBooking} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
      />
    );

    const input = getByPlaceholderText('https://drive.google.com/...');
    const submitButton = screen.getByText('Save Link');

    // Test invalid link
    fireEvent.change(input, { target: { value: 'https://invalid-url.com' } });
    fireEvent.click(submitButton);

    expect(window.alert).toHaveBeenCalledWith('Please enter a valid Google Drive link');
    expect(setDoc).not.toHaveBeenCalled();
  });

  it('handles successful form submission', async () => {
    setDoc.mockResolvedValueOnce();

    const { getByPlaceholderText } = render(
      <HomeworkLinkOverlay 
        booking={mockBooking} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
      />
    );

    const input = getByPlaceholderText('https://drive.google.com/...');
    const submitButton = screen.getByText('Save Link');

    fireEvent.change(input, { target: { value: 'https://drive.google.com/valid-link' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(setDoc).toHaveBeenCalledWith(
        expect.any(Object),
        {
          homeworkLink: 'https://drive.google.com/valid-link',
          homeworkUploadedAt: expect.any(String)
        },
        { merge: true }
      );
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles submission error', async () => {
    const error = new Error('Firebase error');
    setDoc.mockRejectedValueOnce(error);

    const { getByPlaceholderText } = render(
      <HomeworkLinkOverlay 
        booking={mockBooking} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
      />
    );

    const input = getByPlaceholderText('https://drive.google.com/...');
    const submitButton = screen.getByText('Save Link');

    fireEvent.change(input, { target: { value: 'https://drive.google.com/valid-link' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to save homework link');
      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  it('closes overlay when cancel button is clicked', () => {
    render(
      <HomeworkLinkOverlay 
        booking={mockBooking} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
