"use client";
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from "@/lib/firebase";
import { useEffect, useState } from 'react';
import { useUser } from '@/components/providers/UserContext';
import Calendar from '@/components/calendar/Calendar';
import ErrorMessage from '@/components/common/ErrorMessage';


export default function StudentAccount() {
    const { user, loading: userLoading, teacherList, fetchTeachers} = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [teacherAvailability, setTeacherAvailability] = useState(null);
    const [teacherName, setTeacherName] = useState('');
    const [teacherPrice, setTeacherPrice] = useState(0);
    const [error, setError] = useState('')

    async function handleSelectTeacher(e) {
        const selectedValue = e.target.value;
        setSelectedTeacher(selectedValue);
        if (selectedValue) {
            console.log('Selected teacher ID:', selectedValue);
            const teacherData = teacherList[selectedValue];
            setTeacherPrice(teacherData.price);
            setTeacherName(teacherData.nickname);
            console.log('Teacher data:', teacherData);
            setTeacherAvailability(teacherData.availability);
            console.log('teacher Availability:', teacherData.availability);
        } else {
            setTeacherAvailability(null);
            setTeacherName('');
            setTeacherPrice(0);
        }
    }

    const Header = () => {
        return(
            <header className="flex flex-none items-center justify-between border-b border-gray-200 px-6 py-4">
                <h1 className="text-base font-semibold leading-6 text-gray-900">
                    <time dateTime="2022-01">{new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}</time>
                </h1>

                <div>
                    <select 
                        onChange={handleSelectTeacher}
                        value={selectedTeacher}
                        className="rounded-md border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                    >
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
        console.log("Student page mount - userLoading:", userLoading, "user:", user, "isLoading:", isLoading);
        
        const fetchData = async () => {
            try {
                if (!user?.uid) {
                    console.log("No user ID yet, setting isLoading false");
                    setIsLoading(false);
                    return;
                }
                console.log("Fetching data for user:", user.uid);
                
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
            <h1> {teacherName ? `${teacherName}'s rate is ${teacherPrice} dollars per hour` : 'Select a teacher'}</h1>
            <h1>Your balance is {user.balance} dollars</h1>
            <Header/>
            <div className="flex h-full flex-col">
                <Calendar 
                    availability={teacherAvailability}
                    teacherData={{
                        uid: selectedTeacher,
                        nickname: teacherName,
                        pricing: teacherPrice
                    }}
                    userType="student"
                />

                <div className="text-sm text-gray-500 mt-2">
                    Debug - Selected Teacher: {selectedTeacher}
                    <br />
                    Debug - Availability: {JSON.stringify(teacherAvailability)}
                </div>

            </div>
        </div>
    );
}