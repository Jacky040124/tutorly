"use client";
import { app, db, auth, doc, setDoc, getDoc } from '@/app/firebase'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/UserContext';
import Calendar from '@/components/Calendar';
import CalendarOverlay from '@/components/CalendarOverlay';

export default function TeacherAccount() {
    const { user } = useUser();
    const router = useRouter();
    const [showOverlay, setShowOverlay] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [availability, setAvailability] = useState([]);

    useEffect(() => {
        const fetchAvailability = async () => {
            if (user?.uid) {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                const availabilityData = docSnap.data()?.availability || [];
                setAvailability(availabilityData);
            }
        };
        
        fetchAvailability();
    }, [user]);


    function handleRemoveEvent() {

    }
    
    useEffect(() => {
        console.log('TeacherAccount mounted, user:', user);
        
        const timer = setTimeout(() => {
            if (!user) {
                console.log('No user found, redirecting to signin');
                router.replace('/signin');
            } else if (user.type !== 'teacher') {
                console.log('User is not a teacher, redirecting');
                router.replace(user.type === 'student' ? '/user/student' : '/signin');
            }
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [user, router]);

    if (isLoading || !user || user.type !== 'teacher') {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="text-lg">Loading...</div>
        </div>;
    }
    
    return (
        <div>
            <h2>Hi, {user?.uid}</h2>
            <h1>Who&apos;s ready to maximise shareholder value?</h1>
            <div className="flex h-full flex-col">
                <header className="flex flex-none items-center justify-between border-b border-gray-200 px-6 py-4">
                    <h1 className="text-base font-semibold leading-6 text-gray-900">
                        <time dateTime="2022-01">{new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}</time>
                    </h1>
                    <div>
                    <button onClick={handleRemoveEvent} type="button" className="ml-6 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                        Remove event
                    </button>
                    <button onClick={() => setShowOverlay(true)} type="button" className="ml-6 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                        Add event
                    </button>
                    </div>
                </header>
                
                <Calendar setShowOverlay={setShowOverlay}/>
                {showOverlay && <CalendarOverlay setShowOverlay={setShowOverlay}/>}
            </div>
        </div>
    );
}