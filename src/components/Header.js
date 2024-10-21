import '@/app/globals.css';
import {links} from '../../lib/data.js';
import Link from "next/link";
import clsx from 'clsx'

export default function Header() {
    return (
        <nav className='flex justify-center'>
            {links.map(link => (
                <li key={link.hash}>
                    <Link className={clsx("flex w-full items-center justify-center px-3 py-3  hover:text-gray-950")} href={link.hash}>
                        {link.name}
                    </Link>
                </li>
            ))}
        </nav>
    );
}