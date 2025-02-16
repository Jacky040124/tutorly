"use client";

import { useParams } from "next/navigation";
import { useTeachers } from "@/hooks/useTeacher";
import { Teacher } from "@/types/teacher";
import TeacherCalendar from "@/components/TeacherCalendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default function Store() {
  const { userId, teacherId } = useParams();
  const { getTeacherById } = useTeachers();

  const teacher: Teacher | undefined = getTeacherById(teacherId as string);
  
  if (!teacher) {
    return <div>Teacher not found</div>;
  }

  return (
    <div className="container mx-auto py-4 space-y-4">
      <Card className="overflow-hidden">
        <div className="md:grid md:grid-cols-[280px,1fr] md:min-h-[280px]">
          {/* Left Column - Photo and Basic Info */}
          <div className="p-6 bg-muted/10">
            <div className="relative w-40 h-40 mx-auto mb-4 rounded-lg overflow-hidden">
              <Image
                src={teacher.details.photoURL || "/default-avatar.png"}
                alt={teacher.details.nickname}
                fill
                className="object-cover"
              />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold">{teacher.details.nickname}</h2>
              <p className="text-lg text-muted-foreground mb-3">
                ${teacher.details.pricing}/hour
              </p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {teacher.details.expertise.split(",").map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <section>
                  <h3 className="font-semibold text-lg">About</h3>
                  <p className="text-sm text-muted-foreground">
                    {teacher.details.description || teacher.details.introduction || "No description provided"}
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-lg">Education</h3>
                  <p className="text-sm text-muted-foreground">
                    {teacher.details.education || "No education information provided"}
                  </p>
                </section>
              </div>

              <div className="space-y-4">
                <section>
                  <h3 className="font-semibold text-lg">Teaching Experience</h3>
                  <p className="text-sm text-muted-foreground">
                    {teacher.details.experience || "No experience information provided"}
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-lg">Teaching Style</h3>
                  <p className="text-sm text-muted-foreground">
                    {teacher.details.teachingStyle || "No teaching style information provided"}
                  </p>
                </section>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="h-[800px]">
        <TeacherCalendar teacher={teacher} />
      </div>
    </div>
  );
}
