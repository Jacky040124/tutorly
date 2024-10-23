import Header from "@/components/Header";
import Teachers from "@/components/Teachers";
import Tutorial from "@/components/Tutorial";
import Disclaimer from "@/components/Disclaimer";
import Link from 'next/link';




export default function Home() {
    return (
        <div>
            <Header />
            <p> Learn Faster with the best tutor ever</p>
            <Link href="/SignUp">SignUp</Link>
            <Teachers />
            <Tutorial />
            <Disclaimer />
        </div>
    );
}