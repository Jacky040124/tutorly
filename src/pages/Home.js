import Link from 'next/link';
import mountainImage from "../../lib/Mountain image.jpeg"
import Image from 'next/image';



export default function Home() {
    return (
        <div>
            
            {/* Home */}
            <div class="w-full h-[35vh] bg-green-600 p-5">
                <nav class='flex justify-center pb-10'>
                    <Link class='pr-5' href="#home"> Home </Link>
                    <Link class='pr-5' href="#Teacher"> Teacher </Link>
                    <Link class='pr-5' href="#Tutorial"> Tutorial </Link>
                    <Link class='pr-5' href="#Disclaimer"> Disclaimer </Link>
                </nav>
                
                <div class="flex justify-center items-center flex-row scale-120 p-5">
                    <div class="flex flex-col">
                        <h1 class="text-4xl font-bold max-w-56 pb-5"> Learn faster with the best tutor</h1>
                        <Link href="/SignUp"> <button class="bg-gray-950 text-white text-xs rounded hover:bg-gray-800 w-48 h-8"> Get Started </button> </Link>
                    </div>
                    <div> <Image src={mountainImage} alt="Mountain"/> </div>
                </div>
            </div>


            <hr class="bg-gray-200 w-2/3 m-auto"/>
            {/* Teacher */}
            <div class="flex justify-around mb-8 pt-10">
                
                <div class="stat-item">
                    <h2 class="text-green-500 text-4xl m-0">500+</h2>
                    <p class="text-gray-500 text-base">Experienced tutors</p>
                </div>

                <div class="stat-item">
                    <h2 class="text-green-500 text-4xl m-0">30,000+</h2>
                    <p class="text-gray-500 text-base">5-star tutor reviews</p>
                </div>

                <div class="stat-item">
                    <h2 class="text-green-500 text-4xl m-0">100+</h2>
                    <p class="text-gray-500 text-base">Courses taught</p>
                </div>
            </div>

            <div class="grid grid-cols-3 gap-5 mb-5 p-5">
                {Array(9).fill(null).map((_, index) => (
                    <div key={index} class="border border-gray-300 p-10 text-center text-lg cursor-pointer transform transition-transform duration-200 hover:scale-105">
                        <p>Class</p>
                    </div>
                ))}
            </div>

            <div class="mt-5 pl-10">
                <button class="px-5 py-2 text-white bg-green-500 border-none cursor-pointer transition-colors duration-300 hover:bg-green-600"> Show more </button>
            </div>

            {/* Tutorial */}
            <div class="max-w-5xl mx-auto p-5 text-center pt-10 pb-10">
                <h1 class="text-4xl font-bold mb-5">Find the right fit for you</h1>
                <p class="text-gray-500 mb-8">with from over 100 courses, whenever and wherever</p>

                <div class="flex justify-center items-center mb-10">
                    <div class="bg-green-500 w-40 h-60 mx-2 transform translate-x-3 translate-y-3 opacity-70"></div>
                    <div class="bg-green-500 w-40 h-60 mx-2 transform translate-x-1 translate-y-1 opacity-85"></div>
                    <div class="bg-green-500 w-40 h-60 mx-2"></div>
                </div>

                <blockquote class="italic font-medium">"I love the bulk class!!! It is really great."</blockquote>
                <cite class="block mt-2">Jacky, Learner on MeetYourTutor</cite>
                <h2 class="text-3xl font-bold mt-10 mb-5">How does it work?</h2>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {Array(3).fill(null).map((_, index) => (<div key={index} class="bg-green-300 w-full h-40"></div>))}
                </div>
            </div>
            
            <hr class="bg-gray-200 w-2/3 m-auto"/>
            {/* BecomeATutor */}
            <div class="max-w-5xl mx-auto p-5">
                <div class="bg-green-500 py-20 mb-20 text-center">
                    <h1 class="text-5xl font-bold text-white">Lessons you'll love. Guaranteed.</h1>
                    <p class="text-white mt-4 text-lg">Try out our bulk class for free</p>
                </div>
        
                <div class="flex flex-col md:flex-row gap-10 items-stretch">
                    <div class="bg-gray-300 w-full h-80"></div>
                    <div class="bg-green-300 w-full p-10 flex flex-col justify-between">
                        <div>
                            <h2 class="text-4xl font-bold mb-5">Become a tutor</h2>
                            <p class="text-gray-700 mb-8 text-lg">Earn money and share your knowledge with other students. Sign up today.</p>
                        </div>
                        <div>
                            <button class="bg-black text-white px-8 py-4 mb-5 w-full text-lg">Become a tutor &rarr;</button>
                            <a href="#" class="text-gray-700 underline">How our platform works</a>
                        </div>
                    </div>
                </div>
            </div>
            
            <hr class="bg-gray-200 w-2/3 m-auto"/>
            {/* Disclaimer */}
            <div class="max-w-5xl mx-auto p-5 text-left">
                <h1 class="text-4xl font-bold mb-5">Terms and Conditions</h1>
                <p class="mb-5">
                    Welcome to MeetYourTutor. By accessing and using our website, you agree to comply with and be bound by the following terms and conditions. Please read these terms carefully before using our services.
                </p>
                <h2 class="text-2xl font-bold mb-3">1. General</h2>
                <p class="mb-5">
                    These terms and conditions govern your use of our website and services. By using our platform, you agree to all terms stated here. If you do not agree with any of these terms, you must not use our services.
                </p>
                <h2 class="text-2xl font-bold mb-3">2. User Responsibilities</h2>
                <p class="mb-5">
                    You are responsible for maintaining the confidentiality of your account information, including your password. You agree to provide accurate and up-to-date information when creating an account and using our services.
                </p>
                <h2 class="text-2xl font-bold mb-3">3. Payments and Refunds</h2>
                <p class="mb-5">
                    All payments made through our platform are subject to our payment terms. Refunds may be issued at our discretion, and any requests must be made within the specified timeframe.
                </p>
                <h2 class="text-2xl font-bold mb-3">4. Intellectual Property</h2>
                <p class="mb-5">
                    All content on our website, including text, graphics, logos, and images, is the property of MeetYourTutor or its licensors. You may not reproduce, distribute, or use any of our content without prior written consent.
                </p>
                <h2 class="text-2xl font-bold mb-3">5. Limitation of Liability</h2>
                <p class="mb-5">
                    MeetYourTutor will not be liable for any direct, indirect, incidental, or consequential damages arising from your use of our platform. We do not guarantee the accuracy or reliability of any information provided by tutors or users.
                </p>
                <h2 class="text-2xl font-bold mb-3">6. Changes to Terms</h2>
                <p class="mb-5">
                    We reserve the right to modify these terms at any time. Any changes will be effective immediately upon posting on our website. It is your responsibility to review these terms periodically for updates.
                </p>
                <h2 class="text-2xl font-bold mb-3">7. Contact Us</h2>
                <p class="mb-5">
                    If you have any questions or concerns about these terms, please contact us at support@meetyourtutor.com.
                </p>
            </div>
        </div>
    );
}
