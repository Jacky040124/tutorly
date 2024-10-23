export default function Tutorial() {
    return (
      <div className="max-w-5xl mx-auto p-5 text-center">
        {/* Tutorial Heading */}
        <h1 className="text-4xl font-bold mb-5">Find the right fit for you</h1>
        <p className="text-gray-500 mb-8">with from over 100 courses, whenever and wherever</p>
  
        {/* Tutorial Cards Section */}
        <div className="flex justify-center items-center mb-10">
          <div className="bg-green-500 w-40 h-60 mx-2 transform translate-x-3 translate-y-3 opacity-70"></div>
          <div className="bg-green-500 w-40 h-60 mx-2 transform translate-x-1 translate-y-1 opacity-85"></div>
          <div className="bg-green-500 w-40 h-60 mx-2"></div>
        </div>
        <blockquote className="italic font-medium">"I love the bulk class!!! It is really great."</blockquote>
        <cite className="block mt-2">Jacky, Learner on MeetYourTutor</cite>
  
        {/* How it Works Section */}
        <h2 className="text-3xl font-bold mt-10 mb-5">How does it work?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {Array(3).fill(null).map((_, index) => (
            <div key={index} className="bg-green-300 w-full h-40"></div>
          ))}
        </div>
      </div>
    );
  }