// src/hooks/useTeachers.ts
import { useEffect, useState } from "react";
import { fetchTeachers } from "@/app/[locale]/action";
import { Teacher } from "@/types/teacher";

export function useTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const teacherData = await fetchTeachers();
        setTeachers(teacherData);
      } catch (error) {
        console.error('Error loading teachers:', error);
      }
    };
    loadTeachers();
  }, []);

  function getTeacherById(teacherId: string) {
    return teachers.find((teacher) => teacher.uid === teacherId);
  }

  return { teachers, getTeacherById };
};
