"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useTeachers } from "@/hooks/useTeacher";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const subjects = ["ALL", "MATH", "PHYS", "CHEM", "ENGL", "ECON", "CPSC"];

export default function App() {
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const { teachers, loading, error } = useTeachers();
  const router = useRouter();

  const filteredTeachers =
    selectedSubject === "ALL"
      ? teachers
      : teachers.filter((teacher) => teacher.expertise?.toLowerCase().includes(selectedSubject.toLowerCase()));

  if (loading) {
    return <h2> Loading </h2>;
  }

  if (error) {
    console.error(error);
  }

  return (
    <div>
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-[#58cc02]">Tutorly</span>
            </div>

            <div className="flex items-center space-x-6">
              <Button
                onClick={() => router.push("/auth/signupteacher")}
                className="bg-[#58cc02] text-white hover:bg-[#46a302]"
              >
                Become a Tutor
              </Button>
              <Button
                onClick={() => router.push("/auth/signin")}
                variant="outline"
                className="border-[#58cc02] text-[#58cc02] hover:bg-[#58cc02] hover:text-white"
              >
                Log In
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <div className="bg-[#fff] min-h-screen flex flex-col items-center">
        <div className="text-center mb-12 pt-10">
          <h1 className="text-4xl font-bold text-[#58cc02] pb-4">Find The Perfect Tutor</h1>
          <p className="text-gray-600 text-xl">Learn from the best, achieve your goals</p>
        </div>

        <div className="mb-8 relative w-full max-w-xl px-4">
          <Input
            type="text"
            placeholder="Search for your tutor"
            className="pl-12"
          />
          <Search className="absolute left-8 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>

        <div className="mb-8">
          <div className="flex flex-wrap gap-2 p-2">
            {subjects.map((subject) => (
              <Button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                variant={selectedSubject === subject ? "default" : "secondary"}
                className={selectedSubject === subject ? "bg-[#58cc02] hover:bg-[#46a302]" : ""}
              >
                {subject}
              </Button>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {filteredTeachers.map((teacher) => (
              <Card key={teacher.uid} className="overflow-hidden">
                <div className="relative">
                  <img
                    src={teacher.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.nickname}`}
                    alt={teacher.nickname}
                    className="w-full h-48 object-cover bg-[#f7f7f7]"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.nickname}`;
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 p-4">
                    <h3 className="text-xl font-bold text-white">{teacher.nickname}</h3>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-[#ffd900] fill-current" />
                      <span className="text-gray-800 ml-1 font-medium">5.0/5</span>
                    </div>
                    <span className="text-[#58cc02] font-bold text-lg">${teacher.pricing}/hr</span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{teacher.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {teacher.expertise?.split(",").map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-[#f7f7f7] text-gray-700 hover:bg-[#f7f7f7]"
                      >
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
