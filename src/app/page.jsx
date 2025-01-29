"use client";

import React, { useState } from "react";
import Header from "@/components/landingpage/Header";
import TeacherGrid from "@/components/landingpage/TeacherGrid";
import SubjectFilter from "@/components/landingpage/SubjectFilter";
import { Search } from "lucide-react";
import { useTeachers } from "@/hooks/useTeacher";

const subjects = ["ALL", "MATH", "PHYS", "CHEM", "ENGL", "ECON", "CPSC"];

export default function App() {
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const { teachers, loading, error } = useTeachers();

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
    return (
      <ErrorAlert
        message={error}
        onRetry={refresh}
        className="mx-auto mt-20 max-w-2xl"
      />
    );
  }

  return (
    <div>
      <Header />

      <div className="bg-[#fff] min-h-screen flex flex-col items-center">
        <div className="text-center mb-12 pt-10">
          <h1 className="text-4xl font-bold text-[#58cc02] pb-4">
            Find The Perfect Tutor
          </h1>
          <p className="text-gray-600 text-xl">
            Learn from the best, achieve your goals
          </p>
        </div>

        <div className="mb-8 relative">
          <input
            type="text"
            placeholder="Search for your tutor"
            className="w-full px-12 py-4 bg-white text-gray-800 rounded-2xl border-2 border-[#e5e5e5] pl-12 focus:outline-none focus:border-[#58cc02] focus:ring-2 focus:ring-[#58cc02]/20 transition-all"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>

        <SubjectFilter
          subjects={subjects}
          selectedSubject={selectedSubject}
          onSelectSubject={setSelectedSubject}
        />

        <div className="mb-8">
          <TeacherGrid teachers={filteredTeachers} />
        </div>
      </div>
    </div>
  );
}
