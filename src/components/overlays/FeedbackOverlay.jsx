import { useState } from 'react';
import { useUser } from '../providers/UserContext';
import { useError } from '../providers/ErrorContext';
import { addFeedback, updateFeedback, deleteFeedback } from '@/services/booking.service';

const RATING_OPTIONS = [1, 2, 3, 4, 5];

export default function FeedbackOverlay({ booking, onClose, onFeedbackSubmitted }) {
    const { user } = useUser();
    const { showError } = useError();
    
    const [rating, setRating] = useState(booking.feedback?.rating || 0);
    const [comment, setComment] = useState(booking.feedback?.comment || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const feedbackData = {
                rating,
                comment,
                studentId: user.uid,
                meetingId: booking.id
            };

            if (booking.feedback) {
                await updateFeedback(booking.id, feedbackData);
            } else {
                await addFeedback(booking.id, feedbackData);
            }

            onFeedbackSubmitted();
            onClose();
        } catch (error) {
            showError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this feedback?')) return;
        
        setIsSubmitting(true);
        try {
            await deleteFeedback(booking.id);
            onFeedbackSubmitted();
            onClose();
        } catch (error) {
            showError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
            <div className="fixed inset-0 z-10 overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            {booking.feedback ? 'Edit Feedback' : 'Add Feedback'}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Rating</label>
                                <div className="flex gap-2 mt-1">
                                    {RATING_OPTIONS.map((value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setRating(value)}
                                            className={`p-2 ${rating >= value ? 'text-yellow-400' : 'text-gray-300'}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Comment</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={4}
                                    className="form-input mt-1"
                                    placeholder="Share your thoughts about the session..."
                                />
                            </div>
                        </div>

                        <div className="mt-5 sm:mt-6 flex justify-end gap-2">
                            {booking.feedback && (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={isSubmitting}
                                    className="overlay-button-secondary text-red-600"
                                >
                                    Delete
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={onClose}
                                className="overlay-button-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="overlay-button-primary"
                            >
                                {booking.feedback ? 'Save Changes' : 'Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 