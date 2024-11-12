"use client";
import { db, collection, getDocs, doc, getDoc } from '@/app/firebase'
import { useEffect, useState } from 'react';
import { useUser } from '@/components/UserContext';
import Calendar from '@/components/Calendar';

export default function TeacherAccount() {
    const { user, loading: userLoading, teacherList, availability, updateAvailability, fetchTeachers } = useUser();
    const [showOverlay, setShowOverlay] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [teacherAvailability, setTeacherAvailability] = useState(null);

    async function handleSelectTeacher(e) {
        const selectedValue = e.target.value;
        setSelectedTeacher(selectedValue);
        if (selectedValue) {
            console.log('Selected teacher ID:', selectedValue);
            const teacherData = teacherList[selectedValue];
            console.log('Teacher data:', teacherData);
            setTeacherAvailability(teacherData.availability);
            console.log('teacher Availability:', teacherData.availability);
        } else {
            setTeacherAvailability(null);
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
                                {teacher.name || teacher.email}
                            </option>
                        ))}
                    </select>
                </div>
            </header>
        )
    }

    useEffect(() => {
        const fetchAvailability = async () => {
            if (!user?.uid) return;
            setIsLoading(false)
        };
        
        if (!userLoading) {
            fetchAvailability();
        }
    }, [user, userLoading]);

    useEffect(() => {
        fetchTeachers();
    }, []);
    
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
            <h2>Hi, {user?.uid}</h2>
            <h1>Who&apos;s ready to maximise shareholder value?</h1>
            <Header/>
            <div className="flex h-full flex-col">
                <Calendar 
                    setShowOverlay={setShowOverlay} 
                    availability={teacherAvailability}
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