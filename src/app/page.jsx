"use client";

import React, { useState } from "react";
import Header from "@/components/landingpage/Header";
import TeacherGrid from "@/components/landingpage/TeacherGrid";
import SubjectFilter from "@/components/landingpage/SubjectFilter";
import { Search } from "lucide-react";

// Sample data
const sampleTeachers = [
  {
    uid: "1",
    email: "john@example.com",
    nickname: "John Smith",
    type: "teacher",
    description:
      "Experienced mathematics and physics tutor with over 5 years of teaching experience.",
    expertise: "Mathematics, Physics, Calculus",
    education: "MSc in Physics",
    pricing: 35,
    availability: [],
  },

  {
    uid: "1",
    email: "john@example.com",
    nickname: "John Smith",
    type: "teacher",
    description:
      "Experienced mathematics and physics tutor with over 5 years of teaching experience.",
    expertise: "Mathematics, Physics, Calculus",
    education: "MSc in Physics",
    pricing: 35,
    availability: [],
  },

  {
    uid: "1",
    email: "john@example.com",
    nickname: "John Smith",
    type: "teacher",
    description:
      "Experienced mathematics and physics tutor with over 5 years of teaching experience.",
    expertise: "Mathematics, Physics, Calculus",
    education: "MSc in Physics",
    pricing: 35,
    availability: [],
  },

  {
    uid: "1",
    email: "john@example.com",
    nickname: "John Smith",
    type: "teacher",
    description:
      "Experienced mathematics and physics tutor with over 5 years of teaching experience.",
    expertise: "Mathematics, Physics, Calculus",
    education: "MSc in Physics",
    pricing: 35,
    availability: [],
  },

  {
    uid: "1",
    email: "john@example.com",
    nickname: "John Smith",
    type: "teacher",
    description:
      "Experienced mathematics and physics tutor with over 5 years of teaching experience.",
    expertise: "Mathematics, Physics, Calculus",
    education: "MSc in Physics",
    pricing: 35,
    availability: [],
  },

  {
    uid: "1",
    email: "john@example.com",
    nickname: "John Smith",
    type: "teacher",
    description:
      "Experienced mathematics and physics tutor with over 5 years of teaching experience.",
    expertise: "Mathematics, Physics, Calculus",
    education: "MSc in Physics",
    pricing: 35,
    availability: [],
  },

  {
    uid: "1",
    email: "john@example.com",
    nickname: "John Smith",
    type: "teacher",
    description:
      "Experienced mathematics and physics tutor with over 5 years of teaching experience.",
    expertise: "Mathematics, Physics, Calculus",
    education: "MSc in Physics",
    pricing: 35,
    availability: [],
  },

  {
    uid: "1",
    email: "john@example.com",
    nickname: "John Smith",
    type: "teacher",
    description:
      "Experienced mathematics and physics tutor with over 5 years of teaching experience.",
    expertise: "Mathematics, Physics, Calculus",
    education: "MSc in Physics",
    pricing: 35,
    availability: [],
  },
  // Add more sample teachers as needed
];

const subjects = [
  "ALL",
  "MATH",
  "PHYS",
  "CHEM",
  "ENGL",
  "ECON",
  "CPSC",
];

export default function App() {
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  

  const filteredTeachers =
    selectedSubject === "ALL"
      ? sampleTeachers
      : sampleTeachers.filter((teacher) =>
          teacher.expertise
            ?.toLowerCase()
            .includes(selectedSubject.toLowerCase())
        );

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
