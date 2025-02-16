import { fetchTeachers } from "@/app/action";
import { TeacherList } from "@/components/TeacherList";

export default async function TeachersPage() {
  const teachers = await fetchTeachers();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Find Your Perfect Tutor</h1>
        <p className="text-muted-foreground mt-2">
          Browse through our qualified teachers and find the perfect match for your learning journey
        </p>
      </div>
      <TeacherList teachers={teachers} />
    </div>
  );
} 