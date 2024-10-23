export default function Teachers() {
    return(
        <div>
            <div className="flex justify-around mb-8">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-5">
                {Array(8).fill(null).map((_, index) => (
                    <div key={index} className="border border-gray-300 p-10 text-center text-lg cursor-pointer transform transition-transform duration-200 hover:scale-105">
                        <p>Class</p>
                    </div>
                ))}
            </div>

            <div className="mt-5">
                <button className="px-5 py-2 text-white bg-green-500 border-none cursor-pointer transition-colors duration-300 hover:bg-green-600">
                Show more
                </button>
            </div>
            

        </div>
    )
}



    
    
    
    
    




