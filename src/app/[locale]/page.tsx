"use client";

import { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useTeachers } from "@/hooks/useTeacher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

const subjects = [
  { key: "all", value: "ALL" },
  { key: "math", value: "MATH" },
  { key: "physics", value: "PHYS" },
  { key: "chemistry", value: "CHEM" },
  { key: "english", value: "ENGL" },
  { key: "economics", value: "ECON" },
  { key: "computerScience", value: "CPSC" },
];
const ITEMS_PER_PAGE = 6;

export default function App() {
  const t = useTranslations("Landing");
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const { teachers } = useTeachers();
  const { locale } = useParams();
  const filteredTeachers =
    selectedSubject === "ALL"
      ? teachers
      : teachers.filter((teacher) => teacher.details.expertise?.toLowerCase().includes(selectedSubject.toLowerCase()));

  const totalPages = Math.ceil(filteredTeachers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTeachers = filteredTeachers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Brand Logo */}
            <div>
              <span className="text-2xl font-bold text-primary">{t("header.title")}</span>
            </div>

            {/* Right Side: Language Switcher and Auth Buttons */}
            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-4">
                <Link href={`/${locale}/auth/signin`} scroll={false}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    {t("header.login")}
                  </Button>
                </Link>
                <Link href={`/${locale}/auth/signupteacher`} scroll={false}>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    {t("header.becomeTutor")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary pb-4">{t("hero.title")}</h1>
          <p className="text-muted-foreground text-xl">{t("hero.subtitle")}</p>
        </section>

        {/* Search Section */}
        <section className="mb-8 relative w-full max-w-xl px-4 mx-auto">
          <Input type="text" placeholder={t("search.placeholder")} className="pl-12" />
          <Search className="absolute left-8 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        </section>

        {/* Subject Filter Section */}
        <section className="mb-8" aria-label="Subject filters">
          <div className="flex flex-wrap gap-2 p-2 justify-center">
            {subjects.map(({ key, value }) => (
              <Button
                key={value}
                onClick={() => {
                  setSelectedSubject(value);
                  setCurrentPage(1);
                }}
                variant={selectedSubject === value ? "default" : "secondary"}
                size="sm"
              >
                {t(`subjects.${key}`)}
              </Button>
            ))}
          </div>
        </section>

        {/* Tutors Grid Section */}
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[800px]">
            {paginatedTeachers.map((teacher) => (
              <Card key={teacher.uid} className="overflow-hidden">
                <CardHeader className="relative p-0">
                  {teacher.details.photoURL ? (
                    <Image
                      src={teacher.details.photoURL}
                      alt={teacher.details.nickname}
                      width={500}
                      height={300}
                      priority
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-muted" />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 p-4">
                    <h3 className="text-xl font-bold text-white">{teacher.details.nickname}</h3>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-primary font-bold text-lg">
                      {t("tutors.pricePerHour", { price: teacher.details.pricing })}
                    </span>
                  </div>

                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{teacher.details.introduction}</p>
                </CardContent>

                <CardFooter className="px-6 pb-6 pt-0">
                  <div className="flex flex-wrap gap-2">
                    {teacher.details.expertise?.split(",").map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8 pb-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                {t("pagination.previous")}
              </Button>
              <span className="text-sm text-muted-foreground">
                {t("pagination.pageInfo", { current: currentPage, total: totalPages })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                {t("pagination.next")}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
