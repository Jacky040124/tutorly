"use client";
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from "@/lib/firebase";
import { useEffect, useState } from 'react';
import { useUser } from '@/components/providers/UserContext';
import Calendar from '@/components/calendar/Calendar';
import ErrorMessage from '@/components/common/ErrorMessage';
import { fetchFutureStudentBookings } from "@/services/booking.service";
import FutureBookings from "@/components/calendar/FutureBookings";


export default function StudentAccount() {
    const { user, loading: userLoading, teacherList, fetchTeachers, selectedTeacher, setSelectedTeacher} = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [futureBookings, setFutureBookings] = useState([]);
    const handleSelectTeacher = (e) => setSelectedTeacher(e.target.value);

    const Header = () => {
        return(
            <header className="flex flex-none items-center justify-between border-b border-gray-200 px-6 py-4">
                <h1 className="text-base font-semibold leading-6 text-gray-900">
                    <time dateTime="2022-01">{new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}</time>
                </h1>

                <div>
                    <select onChange={handleSelectTeacher} value={selectedTeacher} className="rounded-md border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
                        <option value="">Select a Teacher</option>
                        {teacherList && Object.entries(teacherList).map(([id, teacher]) => (
                        <option key={id} value={id}> 
                            {teacher.nickname} 
                        </option>
                        ))}
                    </select>
                </div>
            </header>
        )
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!user?.uid) {
                    console.log("No user ID yet, setting isLoading false");
                    setIsLoading(false);
                    return;
                }
                console.log("Fetching data for user:", user.uid);
                
                // Fetch future bookings
                const bookings = await fetchFutureStudentBookings(user.uid);
                setFutureBookings(bookings);
                
            } catch (error) {
                setError(`Error fetching data: ${error.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        if (!userLoading) {
            fetchData();
        }
    }, [user, userLoading]);

    useEffect(() => {
        fetchTeachers();
    }, []);
    
    if (userLoading || isLoading) {
        console.log("Rendering loading state - userLoading:", userLoading, "isLoading:", isLoading);
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
            <h1> {selectedTeacher && teacherList[selectedTeacher] ? 
                `${teacherList[selectedTeacher].nickname}'s rate is ${teacherList[selectedTeacher].pricing} dollars per hour` 
                : 'Select a teacher'}
            </h1>
            <Header/>
            <div className="flex h-full flex-col">
                <Calendar availability={teacherList[selectedTeacher]?.availability} userType="student"/>
                <FutureBookings bookings={futureBookings} />
                <div className="text-sm text-gray-500 mt-2">
                    Debug - Selected Teacher: {selectedTeacher}
                    <br />
                    Debug - Availability: {JSON.stringify(teacherList[selectedTeacher]?.availability)}
                </div>
            </div>
        </div>
    );
}