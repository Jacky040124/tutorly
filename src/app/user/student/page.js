"use client"

import { useContext, useRef, useEffect } from 'react'
import { useUser } from '@/components/UserContext';

export default function StudentAccount() {
    const { user } = useUser();

    return (
        <div>
            <h1>This is student Account</h1>
            <h2>Hi, {user?.uid}</h2>
        </div>
    )
}