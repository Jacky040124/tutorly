import { useState, useRef, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useOverlay } from "@/hooks/useOverlay";
import { uploadImage } from "@/app/[locale]/action";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { Camera } from "lucide-react";
import { updateTeacherProfile } from "@/app/[locale]/action";
import { Teacher } from "@/types/teacher";
import { useToast } from "@/hooks/use-toast";
import { UpdateTeacherProfileState } from "@/app/[locale]/action";


// TODO: Low priority: Adjust UI length
export default function TeacherProfileOverlay() {
  const { user } = useUser();
  const teacher = user as Teacher;
  const { showTeacherProfileOverlay, setShowTeacherProfileOverlay } = useOverlay();
  const t = useTranslations("Profile");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [state, formAction, isPending] = useActionState(updateTeacherProfile, { error: null, updatedProfile: null } as UpdateTeacherProfileState);
  const { toast } = useToast();

  useEffect(() => {
    if (state) {
      if (state.error) {
        toast({
          title: t("updateError"),
          description: state.error,
          variant: "destructive",
        });
      } else if (state.updatedProfile) {
        toast({
          title: t("updateSuccess"),
          variant: "default",
        });
        setShowTeacherProfileOverlay(false);
      }
    }
  }, [state, toast, t, setShowTeacherProfileOverlay]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const result = await uploadImage(file, teacher.uid, "avatars");
      console.log(result);

      toast({
        title: t("imageUploadSuccess"), 
        variant: "default",
      });
    } catch (error) {
      toast({
        title: t("error"),
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={showTeacherProfileOverlay} onOpenChange={setShowTeacherProfileOverlay}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">{t("editProfile")}</DialogTitle>
          <DialogDescription>{t("teacher")}</DialogDescription>
        </DialogHeader>

        {/* Profile Photo */}
        <div className="relative group">
          <Avatar
            className="h-20 w-20 cursor-pointer transition-opacity group-hover:opacity-75"
            onClick={() => fileInputRef.current?.click()}
          >
            <AvatarImage src={teacher?.details.photoURL} />
            <AvatarFallback>{teacher?.details.nickname?.[0]?.toUpperCase()}</AvatarFallback>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </Avatar>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        <form action={formAction} className="space-y-6">
          <input type="hidden" name="userId" value={teacher.uid} />

          <div className="flex items-center space-x-4">
            <div>
              <h3 className="text-lg font-medium">{user?.email}</h3>
              <p className="text-sm text-muted-foreground">{t("teacher")}</p>
            </div>
          </div>

          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Basic Info */}
              <div className="space-y-2">
                <Label htmlFor="nickname">{t("nickname")}</Label>
                <Input 
                  id="nickname" 
                  name="nickname" 
                  defaultValue={teacher.details.nickname}
                  placeholder={t("nicknamePlaceholder")} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="introduction">{t("introduction")}</Label>
                <Textarea
                  id="introduction"
                  name="description"
                  defaultValue={teacher.details.description}
                  placeholder={t("introductionPlaceholder")}
                  rows={3}
                />
              </div>

              {/* Professional Info */}
              <div className="space-y-2">
                <Label htmlFor="expertise">{t("expertise")}</Label>
                <Textarea 
                  id="expertise" 
                  name="expertise" 
                  defaultValue={teacher.details.expertise}
                  placeholder={t("expertisePlaceholder")} 
                  rows={2} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">{t("education")}</Label>
                <Textarea 
                  id="education" 
                  name="education"
                  defaultValue={teacher.details.education}
                  placeholder={t("educationPlaceholder")} 
                  rows={2} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">{t("experience")}</Label>
                <Textarea 
                  id="experience" 
                  name="experience"
                  defaultValue={teacher.details.experience}
                  placeholder={t("experiencePlaceholder")} 
                  rows={2} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teachingStyle">{t("teachingStyle")}</Label>
                <Textarea
                  id="teachingStyle"
                  name="teachingStyle"
                  defaultValue={teacher.details.teachingStyle}
                  placeholder={t("teachingStylePlaceholder")}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowTeacherProfileOverlay(false)}>
              {t("buttons.cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t("buttons.saving") : t("buttons.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
