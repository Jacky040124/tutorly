"use client";

import { useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useParams } from "next/navigation";
import { getUserById } from "@/app/[locale]/action";
import { Teacher } from "@/types/teacher";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { userId } = useParams();
  const { user, setUser } = useUser();

  useEffect(() => {
    async function fetchUser() {
      const user = await getUserById(userId as string);
      setUser(user as Teacher);
    }

    if (!user) {
      fetchUser();
    }
  }, [userId, setUser, user]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
} 