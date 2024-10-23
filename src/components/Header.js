import '@/app/globals.css';
import Link from "next/link";

export default function Header() {
    return (
        <nav className='flex justify-center'>

            <Link className='pr-5' href="#home"> Home </Link>
            <Link className='pr-5' href="#Teacher"> Teacher </Link>
            <Link className='pr-5' href="#Tutorial"> Tutorial </Link>
            <Link className='pr-5' href="#Disclaimer"> Disclaimer </Link>
            
        </nav>
    );
}