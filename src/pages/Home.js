import Header from "@/components/Header";
import Teachers from "@/components/Teachers";
import Tutorial from "@/components/Tutorial";
import Disclaimer from "@/components/Disclaimer";




export default function Home() {
    return (
        <div>
            <Header />
            <p> Learn Faster with the best tutor ever</p>
            <a className="standard-btn bg-green" href="/Login">LogIn</a>
            <Teachers />
            <Tutorial />
            <Disclaimer />
        </div>
    );
}