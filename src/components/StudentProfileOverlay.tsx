import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useOverlay } from "@/hooks/useOverlay";
import { useNotification } from "@/hooks/useNotification";
import { updateStudentProfile } from "@/services/user.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Student } from "@/types/user";

export default function StudentProfileOverlay() {
  const { user, setUser } = useUser();
  const { showStudentProfileOverlay, setShowStudentProfileOverlay } = useOverlay();
  const { showSuccess, showError } = useNotification();
  const t = useTranslations('Profile');

  const [formData, setFormData] = useState({
    nickname: user?.nickname || "",
    introduction: (user as Student).introduction || "",
    interests: (user as Student).interests || "",
    goals: (user as Student).goals || "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prevData) => ({
        nickname: user.nickname ?? prevData.nickname,
        introduction: user.introduction ?? prevData.introduction,
        interests: (user as Student).interests ?? prevData.interests,
        goals: (user as Student).goals ?? prevData.goals,
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (user) {
        await updateStudentProfile(user.uid, formData);
        setUser({ ...user, ...formData });
        showSuccess(t('updateSuccess'));
        setShowStudentProfileOverlay(false);
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
    <Dialog open={showStudentProfileOverlay} onOpenChange={setShowStudentProfileOverlay}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">{t('editProfile')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.photoURL} />
              <AvatarFallback>{user?.nickname?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">{user?.email}</h3>
              <p className="text-sm text-muted-foreground">{t('student')}</p>
            </div>
          </div>

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

              <div className="space-y-2">
                <Label htmlFor="interests">{t('interests')}</Label>
                <Textarea
                  id="interests"
                  name="interests"
                  value={formData.interests}
                  onChange={handleChange}
                  placeholder={t('interestsPlaceholder')}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goals">{t('goals')}</Label>
                <Textarea
                  id="goals"
                  name="goals"
                  value={formData.goals}
                  onChange={handleChange}
                  placeholder={t('goalsPlaceholder')}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowStudentProfileOverlay(false)}>
              {t('buttons.cancel')}
            </Button>
            <Button type="submit">{t('buttons.save')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
