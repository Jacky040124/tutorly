"use client";

import { CalendarDays, UserCircle, Clock } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useUser } from "@/hooks/useUser";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { getUserById } from "@/app/[locale]/action";
import { Student } from "@/types/student";


export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { userId, locale } = useParams();
  const { user, setUser } = useUser();
  const pathname = usePathname();
  const t = useTranslations("Dashboard.Student");

  useEffect(() => {
    async function fetchUser() {
      const user = await getUserById(userId as string);
      setUser(user as Student);
    }

    if (!user) {
      fetchUser();
    }
  }, [user, setUser, userId]);

  const navigation = [
    {
      name: t("navigation.profile"),
      href: "/profile",
      icon: UserCircle,
    },
    {
      name: t("navigation.schedule"),
      href: "/schedule",
      icon: CalendarDays,
    },
    {
      name: t("navigation.classes"),
      href: "/class",
      icon: Clock,
    },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="hidden md:flex h-full w-64 flex-col fixed inset-y-0 z-50">
        <div className="flex flex-col flex-grow bg-gray-50 border-r">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-semibold text-primary">Tutorly</h1>
            </div>
            <nav className="mt-8 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname.includes(item.href);
                return (
                  <Link
                    key={item.name}
                    href={`/${locale}/dashboard/student/${userId}${item.href}`}
                    className={cn(
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-5 w-5 flex-shrink-0",
                        isActive
                          ? "text-primary-foreground"
                          : "text-gray-400 group-hover:text-gray-500"
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
