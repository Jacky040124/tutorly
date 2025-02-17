import { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addFeedback, FeedbackState } from "@/app/[locale]/action";
import { useTranslation } from 'react-i18next';
import { Event } from '@/types/event';
import { useActionState } from 'react';


interface FeedbackOverlayProp {
  event: Event;
  onClose: () => void;
}


// TODO: Implement feedback overlay
export default function FeedbackOverlay({ event, onClose }: FeedbackOverlayProp) {
  const { user } = useUser();
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState(0);
  const { t } = useTranslation();
  const [state, formAction, isPending] = useActionState(addFeedback, { message: "" } as FeedbackState);


  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event.bookingDetails?.feedback ? "Edit Feedback" : "Add Feedback"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <form action={formAction}>
            <input type="hidden" name="eventId" value={event.id} />
            <input type="hidden" name="studentId" value={user?.uid} />
            <input type="hidden" name="rating" value={rating} />
            <input type="hidden" name="comment" value={feedbackText} />
            {state && <p>{state.message}</p>}

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`p-1 ${star <= rating ? "text-yellow-500" : "text-gray-300"}`}
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
            <Button variant="outline" onClick={onClose}>
              {t("profile.buttons.cancel")}
            </Button>
            
            <Button type="submit" disabled={!rating || isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>

          </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 