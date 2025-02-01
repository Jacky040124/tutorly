// src/hooks/useTeachers.ts
import { useEffect, useState } from "react";
import { fetchTeachers } from "@/services/user.service";
import { Teacher } from "@/types/user";

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

  return { teachers };
};
