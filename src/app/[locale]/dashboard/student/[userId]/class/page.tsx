"use client";

import { useParams } from "next/navigation";
import { useTeachers } from "@/hooks/useTeacher";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { useTranslations } from "use-intl";

export default function Class() {
  const { user } = useUser();
  const { userId } = useParams();
  const { locale } = useParams();
  const { teachers } = useTeachers();
  const t = useTranslations("Dashboard.Student.Class");

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers?.map((teacher) => (
          <Card key={teacher.uid} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <Image
                    src={teacher.details.photoURL || "/default-avatar.png"}
                    alt={teacher.details.nickname}
                    fill
                    sizes="(max-width: 64px) 100vw"
                    className="object-cover"
                  />
                </div>
                <div>
                  <CardTitle className="text-xl">{teacher.details.nickname}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {t("pricePerHour", { price: teacher.details.pricing })}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">{t("expertise")}</h4>
                  <div className="flex flex-wrap gap-2">
                    {teacher.details.expertise.split(",").map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{t("about")}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {teacher.details.description || teacher.details.introduction || t("noDescription")}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{t("education")}</h4>
                  <p className="text-sm text-muted-foreground">{teacher.details.education}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/${locale}/dashboard/student/${userId}/class/${teacher.uid}`} className="w-full">
                <Button className="w-full">{t("viewProfile")}</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
