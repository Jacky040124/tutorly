import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/common/Button';
import { Booking } from '@/types/booking';

// TODO: remake using chadcn
export default function HomeworkLinkOverlay({ booking, onClose, onSuccess }) {
  const [link, setLink] = useState(booking.homeworkLink || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValidDriveLink = (url) => {
    return url.includes("google");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isValidDriveLink(link)) {
      alert('Please enter a valid Google Drive link');
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingRef = doc(db, 'bookings', booking.id);
      await setDoc(bookingRef, {
        homeworkLink: link,
        homeworkUploadedAt: new Date().toISOString()
      }, { merge: true });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving homework link:', error);
      alert('Failed to save homework link');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium mb-4">
          {booking.homeworkLink ? 'Update Homework Link' : 'Add Homework Link'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google Drive Link
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              onClick={onClose} 
              variant="outline" 
              color="slate"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="solid" 
              color="blue" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Link'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 