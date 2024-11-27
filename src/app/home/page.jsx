"use client";
import Link from "next/link";

export default function Home() {

  return (
    <div>
      {/* Home */}
      <div className="w-full h-[35vh] bg-green-600 p-5">
        <Link href="/auth/signin">
          {" "}
          <button className="overlay-button-primary">Sign in</button>{" "}
        </Link>

        <nav className="flex justify-center pb-10">
          <Link className="pr-5" href="#home">
            {" "}
            Home{" "}
          </Link>
          <Link className="pr-5" href="#Teacher">
            {" "}
            Teacher{" "}
          </Link>
          <Link className="pr-5" href="#Tutorial">
            {" "}
            Tutorial{" "}
          </Link>
          <Link className="pr-5" href="#Disclaimer">
            {" "}
            Disclaimer{" "}
          </Link>
        </nav>

        <div className="flex justify-center items-center flex-row scale-120 p-5">
          <div className="flex flex-col">
            <h1 className="text-4xl font-bold max-w-56 pb-5">
              {" "}
              Learn faster with the best tutor
            </h1>
            <Link href="/auth/signup">
              {" "}
              <button className="overlay-button-primary">
                Get Started
              </button>{" "}
            </Link>
          </div>
          <div className="w-40 h-40 bg-green-500"></div>
        </div>
      </div>
      <hr className="bg-gray-200 w-2/3 m-auto" />
      {/* Teacher */}
      <div className="flex justify-around mb-8 pt-10">
        <div className="stat-item">
          <h2 className="text-green-500 text-4xl m-0">500+</h2>
          <p className="text-gray-500 text-base">Experienced tutors</p>
        </div>

        <div className="stat-item">
          <h2 className="text-green-500 text-4xl m-0">30,000+</h2>
          <p className="text-gray-500 text-base">5-star tutor reviews</p>
        </div>

        <div className="stat-item">
          <h2 className="text-green-500 text-4xl m-0">100+</h2>
          <p className="text-gray-500 text-base">Courses taught</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-5 mb-5 p-5">
        {Array(9)
          .fill(null)
          .map((_, index) => (
            <div
              key={index}
              className="border border-gray-300 p-10 text-center text-lg cursor-pointer transform transition-transform duration-200 hover:scale-105"
            >
              <p>Class</p>
            </div>
          ))}
      </div>
      <div className="mt-5 pl-10">
        <button className="standard-button">Show more</button>
      </div>
      {/* Tutorial */}
      <div className="max-w-5xl mx-auto p-5 text-center pt-10 pb-10">
        <h1 className="text-4xl font-bold mb-5">Find the right fit for you</h1>
        <p className="text-gray-500 mb-8">
          with from over 100 courses, whenever and wherever
        </p>

        <div className="flex justify-center items-center mb-10">
          <div className="bg-green-500 w-40 h-60 mx-2 transform translate-x-3 translate-y-3 opacity-70"></div>
          <div className="bg-green-500 w-40 h-60 mx-2 transform translate-x-1 translate-y-1 opacity-85"></div>
          <div className="bg-green-500 w-40 h-60 mx-2"></div>
        </div>

        <blockquote className="italic font-medium">
          <blockquote className="italic font-medium">
            &quot;I love the bulk class!!! It is really great.&quot;
          </blockquote>
          &quot;
        </blockquote>
        <cite className="block mt-2">Jacky, Learner on MeetYourTutor</cite>
        <h2 className="text-3xl font-bold mt-10 mb-5">How does it work?</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {Array(3)
            .fill(null)
            .map((_, index) => (
              <div key={index} className="bg-green-300 w-full h-40"></div>
            ))}
        </div>
      </div>
      <hr className="bg-gray-200 w-2/3 m-auto" />
      {/* BecomeATutor */}
      <div className="max-w-5xl mx-auto p-5">
        <div className="bg-green-500 py-20 mb-20 text-center">
          <h1 className="text-5xl font-bold text-white">
            Lessons you love. Guaranteed.
          </h1>
          <p className="text-white mt-4 text-lg">
            Try out our bulk class for free
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-10 items-stretch">
          <div className="bg-gray-300 w-full h-80"></div>
          <div className="bg-green-300 w-full p-10 flex flex-col justify-between">
            <div>
              <h2 className="text-4xl font-bold mb-5">Become a tutor</h2>
              <p className="text-gray-700 mb-8 text-lg">
                Earn money and share your knowledge with other students. Sign up
                today.
              </p>
            </div>
            <div>
              <button className="standard-button">Become a tutor &rarr;</button>
              <a href="#" className="text-gray-700 underline">
                How our platform works
              </a>
            </div>
          </div>
        </div>
      </div>
      <hr className="bg-gray-200 w-2/3 m-auto" />
      {/* Disclaimer */}
      <div className="max-w-5xl mx-auto p-5 text-left">
        <h1 className="text-4xl font-bold mb-5">Terms and Conditions</h1>
        <p className="mb-5">
          Welcome to MeetYourTutor. By accessing and using our website, you
          agree to comply with and be bound by the following terms and
          conditions. Please read these terms carefully before using our
          services.
        </p>
        <h2 className="text-2xl font-bold mb-3">1. General</h2>
        <p className="mb-5">
          These terms and conditions govern your use of our website and
          services. By using our platform, you agree to all terms stated here.
          If you do not agree with any of these terms, you must not use our
          services.
        </p>
        <h2 className="text-2xl font-bold mb-3">2. User Responsibilities</h2>
        <p className="mb-5">
          You are responsible for maintaining the confidentiality of your
          account information, including your password. You agree to provide
          accurate and up-to-date information when creating an account and using
          our services.
        </p>
        <h2 className="text-2xl font-bold mb-3">3. Payments and Refunds</h2>
        <p className="mb-5">
          All payments made through our platform are subject to our payment
          terms. Refunds may be issued at our discretion, and any requests must
          be made within the specified timeframe.
        </p>
        <h2 className="text-2xl font-bold mb-3">4. Intellectual Property</h2>
        <p className="mb-5">
          All content on our website, including text, graphics, logos, and
          images, is the property of MeetYourTutor or its licensors. You may not
          reproduce, distribute, or use any of our content without prior written
          consent.
        </p>
        <h2 className="text-2xl font-bold mb-3">5. Limitation of Liability</h2>
        <p className="mb-5">
          MeetYourTutor will not be liable for any direct, indirect, incidental,
          or consequential damages arising from your use of our platform. We do
          not guarantee the accuracy or reliability of any information provided
          by tutors or users.
        </p>
        <h2 className="text-2xl font-bold mb-3">6. Changes to Terms</h2>
        <p className="mb-5">
          We reserve the right to modify these terms at any time. Any changes
          will be effective immediately upon posting on our website. It is your
          responsibility to review these terms periodically for updates.
        </p>
        <h2 className="text-2xl font-bold mb-3">7. Contact Us</h2>
        <p className="mb-5">
          If you have any questions or concerns about these terms, please
          contact us at support@meetyourtutor.com.
        </p>
      </div>
    </div>
  );
}
