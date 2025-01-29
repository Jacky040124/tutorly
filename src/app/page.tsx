"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useTeachers } from "@/hooks/useTeacher";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

const subjects = ["ALL", "MATH", "PHYS", "CHEM", "ENGL", "ECON", "CPSC"];

export default function App() {
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const { teachers, loading, error } = useTeachers();
  const router = useRouter();

  const filteredTeachers =
    selectedSubject === "ALL"
      ? teachers
      : teachers.filter((teacher) =>
          teacher.expertise
            ?.toLowerCase()
            .includes(selectedSubject.toLowerCase())
        );

  if (loading) {
    return (
      <h2> Loading </h2>
    );
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
              <button
                onClick={() => router.push("/auth/signupteacher")}
                className="bg-[#58cc02] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#46a302] transition-colors shadow-lg shadow-[#58cc02]/30"
              >
                Become a Tutor
              </button>
              <button
                onClick={() => router.push("/auth/signin")}
                className="border-2 border-[#58cc02] text-[#58cc02] px-6 py-3 rounded-2xl font-bold hover:bg-[#58cc02] hover:text-white transition-colors"
              >
                Log In
              </button>
            </div>
          </nav>
        </div>
      </header>

      <div className="bg-[#fff] min-h-screen flex flex-col items-center">
        <div className="text-center mb-12 pt-10">
          <h1 className="text-4xl font-bold text-[#58cc02] pb-4">Find The Perfect Tutor</h1>
          <p className="text-gray-600 text-xl">Learn from the best, achieve your goals</p>
        </div>

        <div className="mb-8 relative">
          <input
            type="text"
            placeholder="Search for your tutor"
            className="w-full px-12 py-4 bg-white text-gray-800 rounded-2xl border-2 border-[#e5e5e5] pl-12 focus:outline-none focus:border-[#58cc02] focus:ring-2 focus:ring-[#58cc02]/20 transition-all"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>

        <div className="mb-8">
          <div className="flex space-x-2 p-2">
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={`
              px-6 py-3 rounded-xl font-medium transition-all
              ${
                selectedSubject === subject
                  ? "bg-[#58cc02] text-white shadow-lg shadow-[#58cc02]/30"
                  : "bg-[#e5e5e5] text-gray-700 hover:bg-[#d1d1d1]"
              }
            `}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 px-10">
            {filteredTeachers.map((teacher) => (
              <div key={teacher.uid} className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-[#e5e5e5]">
                <div className="relative">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.nickname}`}
                    alt={teacher.nickname}
                    className="w-full h-48 object-cover bg-[#f7f7f7]"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 p-4">
                    <h3 className="text-xl font-bold text-white">{teacher.nickname}</h3>
                  </div>
                </div>

                <div className="p-6">
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
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#f7f7f7] text-gray-700 rounded-full text-sm font-medium"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
