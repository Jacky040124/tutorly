import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { addHomework } from "@/app/action";
import { Plus } from "lucide-react";
import { useActionState } from "react";

interface HomeworkOverlayProps {
  bookingId: string;
  t: (key: string) => string;
  tStudent: (key: string) => string;
  onSuccess?: () => void;
}

export default function TeacherHomeworkOverlay({ bookingId, t, tStudent, onSuccess }: HomeworkOverlayProps) {
  const [state, formAction, isPending] = useActionState(addHomework, { message: "" } as any);

  console.log("state:", state);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7">
          <Plus className="h-3 w-3 mr-1" />
          {tStudent("buttons.uploadHomework")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tStudent("buttons.uploadHomework")}</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <input type="hidden" name="bookingId" value={bookingId} />
          <input type="link" name="link" placeholder={t("fields.placeholder.enter")} />
          <div className="flex gap-2">
            <Button type="submit" disabled={isPending}>{t("calendarOverlay.buttons.save")}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
