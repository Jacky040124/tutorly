"use client";
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from "@/lib/firebase";
import { useEffect, useState } from 'react';
import { useUser } from '@/components/providers/UserContext';
import Calendar from '@/components/calendar/Calendar';
import CalendarOverlay from '@/components/calendar/CalendarOverlay';
import TeacherProfileOverlay from '@/components/overlays/TeacherProfileOverlay';
import ErrorMessage from '@/components/common/ErrorMessage';


export default function TeacherAccount() {
    const { user, availability, updateAvailability } = useUser();
    const [showCalendarOverlay, setShowCalendarOverlay] = useState(false);
    const [showTeacherProfileOverlay, setShowTeacherProfileOverlay] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { loading: userLoading } = useUser();
    const [error, setError] = useState();

    const handleClickEvent = async (day, startTime, endTime) => {
        const confirmDelete = window.confirm("Do you want to remove this time slot?");
        
        if (confirmDelete) {
            try {
                // Filter out the selected event from availability
                const updatedAvailability = availability.filter(event => {
                    // Convert the event's day to the same format (1-7) as the calendar
                    const eventDate = new Date(event.date.year, event.date.month - 1, event.date.day);
                    const eventDay = eventDate.getDay();
                    const adjustedEventDay = eventDay === 0 ? 7 : eventDay;

                    return !(adjustedEventDay === day && 
                            event.startTime === startTime && 
                            event.endTime === endTime);
                });

                console.log("Original availability:", availability);
                console.log("Updated availability:", updatedAvailability);

                // Update Firebase and context
                await updateAvailability(updatedAvailability);
                console.log("Event removed successfully");

            } catch (error) {
                console.error("Error removing event:", error);
                setError(`Failed to remove event: ${error.message}`);
            }
        }
    }

    const Header = () => {
        return(
            <header className="flex flex-none items-center justify-between border-b border-gray-200 px-6 py-4">

            <h1 className="text-base font-semibold leading-6 text-gray-900">
                <time dateTime="2022-01">{new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}</time>
            </h1>

            <div>
                <button onClick={() => setShowTeacherProfileOverlay(true)} type="button" className="standard-button">
                    Profile
                </button>

                <button onClick={() => setShowCalendarOverlay(true)} type="button" className="standard-button">
                    Add event
                </button>
            </div>
        </header>
        )
    }

    useEffect(() => {
        const fetchAvailability = async () => {
            if (!user?.uid) return;
            
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                const availabilityData = docSnap.data()?.availability || [];
                updateAvailability(availabilityData);
            } catch (error) {
                console.error('Error fetching availability:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        if (!userLoading) {
            fetchAvailability();
        }
    }, [user, userLoading]);
    
    if (userLoading || isLoading) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="text-lg">Loading...</div>
        </div>;
    }
    
    if (!user) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="text-lg">Please sign in to access this page</div>
        </div>;
    }
    
    return (
        <div>
            {error && <ErrorMessage message={error} />}
            <h2>Hi, {user.nickname}</h2>
            <h1>Who&apos;s ready to maximise shareholder value?</h1>
            <div className="flex h-full flex-col">
                <Header/>
                <Calendar 
                    availability={availability} 
                    teacherData={{
                        uid: user.uid,
                        email: user.email,
                        // Include other necessary teacher data
                    }}
                    userType="teacher"
                    handleClickEvent={handleClickEvent}
                />
                {showCalendarOverlay && <CalendarOverlay setShowOverlay={setShowCalendarOverlay}/>}
                {showTeacherProfileOverlay && <TeacherProfileOverlay setShowOverlay={setShowTeacherProfileOverlay}/>}
                
            </div>
        </div>
    );
}