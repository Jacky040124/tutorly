"use client"

import { GraduationCap, Brain, Globe, Rocket, Trophy, BookOpen, Users, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

function App() {
  return (
    <div className="min-h-screen bg-[#58CC02] text-white">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8" />
            <span className="text-2xl font-bold">tutorly</span>
          </div>
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-white/20 hover:text-white focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                  How it Works
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-white/20 hover:text-white focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                  Subjects
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <div className="flex gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost" className="text-white hover:bg-white/20">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-white text-[#58CC02] hover:bg-white/90">Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Learn Anything, <br />
              <span className="text-yellow-300">Anytime</span>
            </h1>
            <p className="text-xl text-green-50">
              Connect with expert tutors instantly and master any subject from the comfort of your home.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-white text-[#58CC02] hover:bg-white/90">
                  Start Learning
                </Button>
              </Link>
              <Link href="/dashboard/user/student">
                <Button size="lg" variant="secondary">
                  Find a Tutor
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="bg-white text-gray-800 py-20">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-16">How Tutorly Works</h2>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="relative">
                <div className="bg-green-50 p-8 rounded-3xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-[#58CC02] p-3 rounded-full">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold">1. Find Your Tutor</h3>
                  </div>
                  <p className="text-gray-600">
                    Browse through our verified expert tutors and find the perfect match for your subject and learning
                    style.
                  </p>
                </div>
                <ArrowRight className="hidden md:block absolute -right-6 top-1/2 transform -translate-y-1/2 text-[#58CC02] w-8 h-8" />
              </div>

              <div className="relative">
                <div className="bg-green-50 p-8 rounded-3xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-[#58CC02] p-3 rounded-full">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold">2. Schedule Sessions</h3>
                  </div>
                  <p className="text-gray-600">
                    Book sessions at times that work for you. Flexible scheduling means learning fits your lifestyle.
                  </p>
                </div>
                <ArrowRight className="hidden md:block absolute -right-6 top-1/2 transform -translate-y-1/2 text-[#58CC02] w-8 h-8" />
              </div>

              <div className="bg-green-50 p-8 rounded-3xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-[#58CC02] p-3 rounded-full">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">3. Start Learning</h3>
                </div>
                <p className="text-gray-600">
                  Join interactive online sessions with screen sharing, virtual whiteboard, and real-time collaboration
                  tools.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-[#4CAF00] py-20">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-16">Why Choose Tutorly?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl transform hover:scale-105 transition-transform duration-300">
                <div className="bg-white/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <Globe className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-center mb-4">Learn Anywhere</h3>
                <p className="text-green-50 text-center">
                  Access tutoring sessions from any device, anywhere in the world
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl transform hover:scale-105 transition-transform duration-300">
                <div className="bg-white/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <Brain className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-center mb-4">Expert Tutors</h3>
                <p className="text-green-50 text-center">Connect with verified experts in every subject</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl transform hover:scale-105 transition-transform duration-300">
                <div className="bg-white/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <Rocket className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-center mb-4">Learn at Your Pace</h3>
                <p className="text-green-50 text-center">Flexible scheduling and personalized learning paths</p>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-6 py-20">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl transform hover:-translate-y-2 transition-transform duration-300">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8" />
                </div>
                <div className="text-5xl font-bold mb-2 text-center">1M+</div>
                <div className="text-green-100 text-center text-lg">Active Students</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl transform hover:-translate-y-2 transition-transform duration-300">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8" />
                </div>
                <div className="text-5xl font-bold mb-2 text-center">50K+</div>
                <div className="text-green-100 text-center text-lg">Expert Tutors</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl transform hover:-translate-y-2 transition-transform duration-300">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div className="text-5xl font-bold mb-2 text-center">100+</div>
                <div className="text-green-100 text-center text-lg">Subjects</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#FFFFFF] py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-8">
            <GraduationCap className="w-8 h-8" />
            <span className="text-2xl text-green-500 font-bold">tutorly</span>
          </div>
          <p className="text-center text-green-500">© 2024 Tutorly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
