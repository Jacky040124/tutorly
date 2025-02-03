import { useState, useEffect, useRef } from "react";
import { useUser } from "@/hooks/useUser";
import { useOverlay } from "@/hooks/useOverlay";
import { useNotification } from "@/hooks/useNotification";
import { updateTeacherProfile } from "@/services/user.service";
import { uploadImage } from "@/services/storage.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from 'next-intl';
import { Teacher, isTeacher } from "@/types/user";
import { Camera } from "lucide-react";

export default function TeacherProfileOverlay() {
  const { user, updateTeacherProfile } = useUser();
  const { showTeacherProfileOverlay, setShowTeacherProfileOverlay } = useOverlay();
  const { showSuccess, showError } = useNotification();
  const t = useTranslations('Profile');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    nickname: "",
    introduction: "",
    expertise: "",
    education: "",
    experience: "",
    teachingStyle: "",
    photoURL: "",
  });

  useEffect(() => {
    if (user && isTeacher(user)) {
      setFormData({
        nickname: user.nickname,
        introduction: user.introduction || "",
        expertise: user.expertise || "",
        education: user.education || "",
        experience: user.experience || "",
        teachingStyle: user.teachingStyle || "",
        photoURL: user.photoURL || "",
      });
    }
  }, [user]);

  if (!user || !isTeacher(user)) {
    return null;
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadImage(file, `teachers/${user?.uid}/profile`);
      setFormData(prev => ({ ...prev, photoURL: result.downloadUrl }));
      showSuccess(t('imageUploadSuccess'));
    } catch (error) {
      if (error instanceof Error) {
        showError(error.message);
      } else {
        showError(t('imageUploadError'));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await updateTeacherProfile(formData);
      showSuccess(t('updateSuccess'));
      setShowTeacherProfileOverlay(false);
    } catch (error) {
      showError(t('updateError'));
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={showTeacherProfileOverlay} onOpenChange={setShowTeacherProfileOverlay}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">{t('editProfile')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <Avatar 
                className="h-20 w-20 cursor-pointer transition-opacity group-hover:opacity-75"
                onClick={() => fileInputRef.current?.click()}
              >
                <AvatarImage src={formData.photoURL} />
                <AvatarFallback>{formData.nickname?.[0]?.toUpperCase()}</AvatarFallback>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium">{user?.email}</h3>
              <p className="text-sm text-muted-foreground">{t('teacher')}</p>
            </div>
          </div>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">{t('basicInfo')}</TabsTrigger>
              <TabsTrigger value="professional">{t('professionalInfo')}</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nickname">{t('nickname')}</Label>
                    <Input
                      id="nickname"
                      name="nickname"
                      value={formData.nickname}
                      onChange={handleChange}
                      placeholder={t('nicknamePlaceholder')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="introduction">{t('introduction')}</Label>
                    <Textarea
                      id="introduction"
                      name="introduction"
                      value={formData.introduction}
                      onChange={handleChange}
                      placeholder={t('introductionPlaceholder')}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="professional">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="expertise">{t('expertise')}</Label>
                    <Textarea
                      id="expertise"
                      name="expertise"
                      value={formData.expertise}
                      onChange={handleChange}
                      placeholder={t('expertisePlaceholder')}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="education">{t('education')}</Label>
                    <Textarea
                      id="education"
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      placeholder={t('educationPlaceholder')}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">{t('experience')}</Label>
                    <Textarea
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder={t('experiencePlaceholder')}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teachingStyle">{t('teachingStyle')}</Label>
                    <Textarea
                      id="teachingStyle"
                      name="teachingStyle"
                      value={formData.teachingStyle}
                      onChange={handleChange}
                      placeholder={t('teachingStylePlaceholder')}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowTeacherProfileOverlay(false)}>
              {t('buttons.cancel')}
            </Button>
            <Button type="submit">{t('buttons.save')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
