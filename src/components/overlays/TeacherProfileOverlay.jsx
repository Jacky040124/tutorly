import { useState, useEffect } from "react";
import { useUser } from "@/components/providers/UserContext";
import { useOverlay } from "@/components/providers/OverlayContext";
import { useNotification } from "@/components/providers/NotificationContext";
import { updateTeacherProfile } from "@/services/user.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";

export default function TeacherProfileOverlay() {
  const { user, setUser } = useUser();
  const { showTeacherProfileOverlay, setShowTeacherProfileOverlay } = useOverlay();
  const { showSuccess, showError } = useNotification();
  const { t } = useTranslation("common");

  const [formData, setFormData] = useState({
    nickname: user?.nickname || "",
    introduction: user?.introduction || "",
    expertise: user?.expertise || "",
    education: user?.education || "",
    experience: user?.experience || "",
    teachingStyle: user?.teachingStyle || "",
  });

  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        nickname: user.nickname ?? prevData.nickname,
        introduction: user.introduction ?? prevData.introduction,
        expertise: user.expertise ?? prevData.expertise,
        education: user.education ?? prevData.education,
        experience: user.experience ?? prevData.experience,
        teachingStyle: user.teachingStyle ?? prevData.teachingStyle,
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateTeacherProfile(user.uid, formData);
      setUser({ ...user, ...formData });
      showSuccess(t("profile.updateSuccess"));
      setShowTeacherProfileOverlay(false);
    } catch (error) {
      showError(t("profile.updateError"));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={showTeacherProfileOverlay} onOpenChange={setShowTeacherProfileOverlay}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">{t("profile.editProfile")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.photoURL} />
              <AvatarFallback>{(user?.nickname || "U")?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">{user?.email}</h3>
              <p className="text-sm text-muted-foreground">{t("profile.teacher")}</p>
            </div>
          </div>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">{t("profile.basicInfo")}</TabsTrigger>
              <TabsTrigger value="professional">{t("profile.professionalInfo")}</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nickname">{t("profile.nickname")}</Label>
                    <Input
                      id="nickname"
                      name="nickname"
                      value={formData.nickname}
                      onChange={handleChange}
                      placeholder={t("profile.nicknamePlaceholder")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="introduction">{t("profile.introduction")}</Label>
                    <Textarea
                      id="introduction"
                      name="introduction"
                      value={formData.introduction}
                      onChange={handleChange}
                      placeholder={t("profile.introductionPlaceholder")}
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
                    <Label htmlFor="expertise">{t("profile.expertise")}</Label>
                    <Textarea
                      id="expertise"
                      name="expertise"
                      value={formData.expertise}
                      onChange={handleChange}
                      placeholder={t("profile.expertisePlaceholder")}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="education">{t("profile.education")}</Label>
                    <Textarea
                      id="education"
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      placeholder={t("profile.educationPlaceholder")}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">{t("profile.experience")}</Label>
                    <Textarea
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder={t("profile.experiencePlaceholder")}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teachingStyle">{t("profile.teachingStyle")}</Label>
                    <Textarea
                      id="teachingStyle"
                      name="teachingStyle"
                      value={formData.teachingStyle}
                      onChange={handleChange}
                      placeholder={t("profile.teachingStylePlaceholder")}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowTeacherProfileOverlay(false)}
            >
              {t("teacherProfile.buttons.cancel")}
            </Button>
            <Button type="submit">
              {t("teacherProfile.buttons.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


