import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useOverlay } from "@/hooks/useOverlay";
import { useNotification } from "@/hooks/useNotification";
import { updateTeacherProfile } from "@/services/user.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from 'next-intl';
import { Teacher } from "@/types/user";

export default function TeacherProfileOverlay() {
  const { user, setUser } = useUser();
  const { showTeacherProfileOverlay, setShowTeacherProfileOverlay } = useOverlay();
  const { showSuccess, showError } = useNotification();
  const t = useTranslations('Profile');

  const [formData, setFormData] = useState({
    nickname: user?.nickname || "",
    introduction: (user as Teacher)?.introduction || "",
    expertise: (user as Teacher)?.expertise || "",
    education: (user as Teacher)?.education || "",
    experience: (user as Teacher)?.experience || "",
    teachingStyle: (user as Teacher)?.teachingStyle || "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prevData) => ({
        nickname: user.nickname ?? prevData.nickname,
        introduction: user.introduction ?? prevData.introduction,
        expertise: (user as Teacher).expertise ?? prevData.expertise,
        education: (user as Teacher).education ?? prevData.education,
        experience: (user as Teacher).experience ?? prevData.experience,
        teachingStyle: (user as Teacher).teachingStyle ?? prevData.teachingStyle,
      }));
    }
  }, [user]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (user) {
        await updateTeacherProfile(user.uid, formData);
        setUser({ ...user, ...formData });
        showSuccess(t('updateSuccess'));
        setShowTeacherProfileOverlay(false);
      }
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
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.photoURL} />
              <AvatarFallback>{(user?.nickname || "U")?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
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
