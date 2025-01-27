// src/hooks/useTeachers.ts
import { useEffect, useState } from "react";
import { fetchTeachers } from "@/services/user.service";
import { Teacher } from "@/types/user";

export const useTeachers = () => {

  const [teachers, setTeachers] = useState <Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchTeachers();
        // parse the data
        setTeachers(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load teachers"
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [fetchTeachers]);

  return { teachers, loading, error, refresh: () => setLoading(true) };
};



