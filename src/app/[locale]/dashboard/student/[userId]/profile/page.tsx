"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { uploadImage } from "@/app/[locale]/action";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Student, createStudentFromData } from "@/types/student";
import { Camera, X } from "lucide-react";
import { useActionState } from "react";
import { updateStudentProfile, UpdateStudentProfileState } from "@/app/[locale]/action";
import { useToast } from "@/hooks/use-toast";
import { handleTagInput } from "@/lib/utils";


// TODO: Fix Profile update after deployment
export default function StudentProfile() {
  const { user, setUser } = useUser();
  const { toast } = useToast();
  const t = useTranslations("Dashboard.Student.Profile");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [state, formAction, isPending] = useActionState(updateStudentProfile, {
    error: null,
    updatedProfile: null,
  } as UpdateStudentProfileState);

  // Initialize interests and goals from student data
  useEffect(() => {
    if (user) {
      const student = user as Student;
      setInterests(student.details.interests || []);
      setGoals(student.details.goals || []);
    }
  }, [user]);

  useEffect(() => {
    if (state.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.error,
      });
    } else if (state.updatedProfile) {
      const updatedStudent = createStudentFromData({
        ...user as Student,
        ...state.updatedProfile,
        interests: state.updatedProfile.details.interests,
        goals: state.updatedProfile.details.goals,
      });

      setUser(updatedStudent);
      setInterests(updatedStudent.details.interests);
      setGoals(updatedStudent.details.goals);
      toast({
        title: "Success",
        description: t("updateSuccess"),
      });
    }
  }, [state, toast, t, user, setUser]);

  if (!user) return null;
  const student = user as Student;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadImage(file, student.uid);
      const updatedStudent = createStudentFromData({
        ...student,
        details: {
          ...student.details,
          photoURL: result.downloadUrl,
        },
      });
      setUser(updatedStudent);
      toast({
        title: "Success",
        description: t("imageUploadSuccess"),
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: t("imageUploadError"),
      });
    }
  };

  const handleInterestAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    handleTagInput(e, interests, setInterests);
  };

  const handleGoalAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    handleTagInput(e, goals, setGoals);
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  const removeGoal = (goal: string) => {
    setGoals(goals.filter((g) => g !== goal));
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-semibold">{t("editProfile")}</CardTitle>
          <CardDescription>{t("student")}</CardDescription>
        </CardHeader>
      </Card>

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="userId" value={student.uid} />
        <input type="hidden" name="photoURL" value={student.details.photoURL || ""} />
        <input type="hidden" name="interests" value={interests.join(",")} />
        <input type="hidden" name="goals" value={goals.join(",")} />

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative group">
                <Avatar
                  className="h-20 w-20 cursor-pointer transition-opacity group-hover:opacity-75"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <AvatarImage src={student.details.photoURL || ""} />
                  <AvatarFallback>{student.nickname?.[0]?.toUpperCase()}</AvatarFallback>
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
              </div>
              <div>
                <h3 className="text-lg font-medium">{student.email}</h3>
                <p className="text-sm text-muted-foreground">{t("student")}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nickname">{t("nickname")}</Label>
                <Input
                  id="nickname"
                  name="nickname"
                  defaultValue={student.nickname}
                  placeholder={t("nicknamePlaceholder")}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="introduction">{t("introduction")}</Label>
                <Textarea
                  id="introduction"
                  name="introduction"
                  defaultValue={student.details.description || ""}
                  placeholder={t("introductionPlaceholder")}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interests">{t("interests")}</Label>
                <div className="space-y-2">
                  <Input
                    id="interests-input"
                    placeholder="What are you interested in learning?   (Press Enter or comma (,) to add, × to remove)"
                    onKeyDown={handleInterestAdd}
                  />
                  <div className="flex flex-wrap gap-2 mt-2 min-h-[2.5rem] p-2 bg-muted/50 rounded-md">
                    {interests.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No interests added yet</p>
                    ) : (
                      interests.map((interest, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md"
                        >
                          <span>{interest}</span>
                          <button
                            type="button"
                            onClick={() => removeInterest(interest)}
                            className="text-primary hover:text-primary/80"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goals">{t("goals")}</Label>
                <div className="space-y-2">
                  <Input
                    id="goals-input"
                    placeholder="What do you want to achieve? (Press Enter or comma (,) to add, × to remove)"
                    onKeyDown={handleGoalAdd}
                  />
                  <div className="flex flex-wrap gap-2 mt-2 min-h-[2.5rem] p-2 bg-muted/50 rounded-md">
                    {goals.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No goals added yet</p>
                    ) : (
                      goals.map((goal, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md"
                        >
                          <span>{goal}</span>
                          <button
                            type="button"
                            onClick={() => removeGoal(goal)}
                            className="text-primary hover:text-primary/80"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? t("buttons.saving") : t("buttons.save")}
          </Button>
        </div>
      </form>
    </div>
  );
}
