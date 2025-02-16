"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Teacher } from "@/types/teacher";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTeachers } from "@/hooks/useTeacher";
import { Skeleton } from "@/components/ui/skeleton";

export default function Store() {
  const { teacherId } = useParams();
  const { teachers } = useTeachers();
  const [teacher, setTeacher] = useState<Teacher | null>(null);

  useEffect(() => {
    if (teachers && teacherId) {
      const foundTeacher = teachers.find((t) => t.uid === teacherId);
      setTeacher(foundTeacher || null);
    }
  }, [teachers, teacherId]);

  if (!teacher) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start gap-6">
              <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                <Image
                  src={teacher.details.photoURL || "/default-avatar.png"}
                  alt={teacher.details.nickname}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{teacher.details.nickname}</CardTitle>
                <CardDescription className="text-lg">
                  ${teacher.details.pricing}/hour
                </CardDescription>
                <div className="mt-4 flex flex-wrap gap-2">
                  {teacher.details.expertise.split(",").map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-semibold mb-3">About</h3>
                <p className="text-muted-foreground">
                  {teacher.details.description || teacher.details.introduction || "No description provided"}
                </p>
              </section>
              
              <section>
                <h3 className="text-xl font-semibold mb-3">Education</h3>
                <p className="text-muted-foreground">{teacher.details.education}</p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">Teaching Experience</h3>
                <p className="text-muted-foreground">
                  {teacher.details.experience || "No experience information provided"}
                </p>
              </section>

              <div className="pt-6">
                <Button size="lg" className="w-full">
                  Book a Session
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 