'use client';
import { useContext, useRef, useEffect } from 'react'
import { UserContext } from '@/components/UserContext';
import { db, doc, setDoc } from "@/app/firebase";


export default function TeacherAccount() {
    const { user } = useContext(UserContext);

        
    
    // TODO : add availability
        // add a field availability
        // allow to add availability

    // TODO : remove availability
        // allow to view availability
        // allow to remove availability
    
    // TODO : show availability in calendar format

    // TODO : Profile Page

    
    
    return (
        <div>
        <h1>Teacher Account Page</h1>
        <h2>Hi, {user?.uid}</h2>

        </div>
    );
}