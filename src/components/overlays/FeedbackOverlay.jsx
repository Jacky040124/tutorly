import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/UserContext';
import { Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { handleFeedbackSubmit } from "@/services/booking.service";
import { useTranslation } from 'react-i18next';

export default function FeedbackOverlay({ booking, onClose, onFeedbackSubmitted }) {
  const { user } = useUser();
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState(0);
  const { t } = useTranslation();

  // Reset feedback form when booking changes
  useEffect(() => {
    if (booking) {
      setFeedbackText(booking.feedback?.comment || "");
      setRating(booking.feedback?.rating || 0);
    } else {
      setFeedbackText("");
      setRating(0);
    }
  }, [booking]);

  const handleSaveFeedback = async () => {
    // Validate required data before proceeding
    if (!user) {
      console.error("User is not authenticated");
      alert(t("errors.not_authenticated"));
      return;
    }

    if (!booking) {
      console.error("Booking information is missing");
      alert(t("errors.booking_missing"));
      return;
    }

    if (!rating) {
      console.error("Rating is required");
      alert(t("errors.rating_required"));
      return;
    }

    try {
      await handleFeedbackSubmit(booking.id, {
        rating,
        comment: feedbackText?.trim() || "",
        studentId: user.uid,
      }, !!booking.feedback);

      onFeedbackSubmitted();
      onClose();
    } catch (error) {
      console.error("Error saving feedback:", error);
      alert(t("errors.feedback_save_failed"));
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{booking.feedback ? 'Edit Feedback' : 'Add Feedback'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`p-1 ${
                  star <= rating ? "text-yellow-500" : "text-gray-300"
                }`}
              >
                <Star className="h-5 w-5" fill={star <= rating ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
          <Textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Write your feedback..."
            className="min-h-[100px]"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
            >
              {t("profile.buttons.cancel")}
            </Button>
            <Button
              onClick={handleSaveFeedback}
              disabled={!rating}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 