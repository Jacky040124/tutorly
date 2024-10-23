export default function BecomeATutor() {
    return (
        <div className="max-w-5xl mx-auto p-5">
          {/* Banner Section */}
          <div className="bg-green-500 py-20 mb-20 text-center">
            <h1 className="text-5xl font-bold text-white">Lessons you’ll love. Guaranteed.</h1>
            <p className="text-white mt-4 text-lg">Try out our bulk class for free</p>
          </div>
    
          {/* Become a Tutor Section */}
          <div className="flex flex-col md:flex-row gap-10 items-stretch">
            <div className="bg-gray-300 w-full h-80"></div>
            <div className="bg-green-300 w-full p-10 flex flex-col justify-between">
              <div>
                <h2 className="text-4xl font-bold mb-5">Become a tutor</h2>
                <p className="text-gray-700 mb-8 text-lg">Earn money and share your knowledge with other students. Sign up today.</p>
              </div>
              <div>
                <button className="bg-black text-white px-8 py-4 mb-5 w-full text-lg">Become a tutor &rarr;</button>
                <a href="#" className="text-gray-700 underline">How our platform works</a>
              </div>
            </div>
          </div>
        </div>
      );
  }