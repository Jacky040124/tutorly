import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ArtifactModal from '@/components/manager/ArtifactModal';
import '@testing-library/jest-dom';

describe('ArtifactModal', () => {
  const mockArtifacts = {
    recording_files: [
      {
        recording_type: 'shared_screen_with_speaker_view',
        duration: 3600, // 60 minutes
        download_url: 'https://example.com/recording1'
      },
      {
        recording_type: 'audio_only',
        duration: 1800, // 30 minutes
        download_url: 'https://example.com/recording2'
      }
    ]
  };

  const mockOnClose = vi.fn();

  test('renders "No Recordings Available" when no recordings exist', () => {
    render(<ArtifactModal artifacts={{}} onClose={mockOnClose} />);
    
    expect(screen.getByText('No Recordings Available')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  test('renders "No Recordings Available" when recordings array is empty', () => {
    render(<ArtifactModal artifacts={{ recording_files: [] }} onClose={mockOnClose} />);
    
    expect(screen.getByText('No Recordings Available')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  test('renders recordings list when artifacts are available', () => {
    render(<ArtifactModal artifacts={mockArtifacts} onClose={mockOnClose} />);
    
    expect(screen.getByText('Meeting Recordings')).toBeInTheDocument();
    expect(screen.getAllByText(/Type:/)).toHaveLength(2);
    expect(screen.getAllByText(/Duration:/)).toHaveLength(2);
    expect(screen.getAllByText('Download Recording')).toHaveLength(2);
  });

  test('displays correct duration in minutes', () => {
    render(<ArtifactModal artifacts={mockArtifacts} onClose={mockOnClose} />);
    
    expect(screen.getByText('Duration: 60 minutes')).toBeInTheDocument();
    expect(screen.getByText('Duration: 30 minutes')).toBeInTheDocument();
  });

  test('renders download links with correct attributes', () => {
    render(<ArtifactModal artifacts={mockArtifacts} onClose={mockOnClose} />);
    
    const downloadLinks = screen.getAllByText('Download Recording');
    
    downloadLinks.forEach((link, index) => {
      expect(link).toHaveAttribute('href', mockArtifacts.recording_files[index].download_url);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  test('calls onClose when close button is clicked', () => {
    render(<ArtifactModal artifacts={mockArtifacts} onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when close button is clicked in no recordings view', () => {
    render(<ArtifactModal artifacts={{}} onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('handles null artifacts gracefully', () => {
    render(<ArtifactModal artifacts={null} onClose={mockOnClose} />);
    
    expect(screen.getByText('No Recordings Available')).toBeInTheDocument();
  });

  test('renders with correct styling classes', () => {
    render(<ArtifactModal artifacts={mockArtifacts} onClose={mockOnClose} />);
    
    // Check modal overlay
    expect(screen.getByRole('dialog')).toHaveClass(
      'fixed',
      'inset-0',
      'bg-black',
      'bg-opacity-50',
      'flex',
      'items-center',
      'justify-center',
      'z-50'
    );

    // Check modal content container
    const modalContent = screen.getByRole('dialog').firstChild;
    expect(modalContent).toHaveClass(
      'bg-white',
      'p-6',
      'rounded-lg',
      'max-w-2xl',
      'w-full',
      'mx-4',
      'max-h-[80vh]',
      'overflow-y-auto'
    );
  });
}); 