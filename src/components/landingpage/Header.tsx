import React from "react";
import { GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-10 w-10 text-[#58cc02]" />
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
  );
};

export default Header;
