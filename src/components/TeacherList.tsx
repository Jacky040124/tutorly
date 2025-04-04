import { Teacher } from "@/types/teacher";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TeacherListProps {
  teachers: Teacher[];
}

export function TeacherList({ teachers }: TeacherListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {teachers.map((teacher) => (
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
                  ${teacher.details.pricing}/hour
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">Expertise</h4>
                <div className="flex flex-wrap gap-2">
                  {teacher.details.expertise.split(",").map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">About</h4>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {teacher.details.description || teacher.details.introduction || "No description provided"}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Education</h4>
                <p className="text-sm text-muted-foreground">{teacher.details.education}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href={`/dashboard/student/teacher/${teacher.uid}`} className="w-full">
              <Button className="w-full">View Profile</Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 