import Header from "@/components/Header";
import Teachers from "@/components/Teachers";
import Tutorial from "@/components/Tutorial";
import BecomeATutor from "@/components/BecomeATutor";
import Disclaimer from "@/components/Disclaimer";
import Link from 'next/link';
import mountainImage from "../../lib/Mountain image.jpeg"
import Image from 'next/image';



export default function Home() {
    return (
        <div>
            <Header />

            <div class="bg-clip-border w-full h-96 bg-emerald-500 flex flex-row justify-items-center">
                <div class=" flex flex-col justify-center">
                    <h1 class="text-3xl font-bold"> Learn Faster with the best tutor ever</h1>
                    <Link href="/SignUp"> <button class="bg-gray-950 text-white text-xs rounded hover:bg-gray-800 w-48 h-8"> Get Started </button> </Link>
                </div>

                <div> <Image src={mountainImage} alt="Mountain" width={500} height={300} /> </div>

            </div>

            <Teachers />
            <Tutorial />
            <BecomeATutor />
            <Disclaimer />
        </div>
    );
}