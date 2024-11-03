'use client';

import { useState } from 'react';
import Calendar from './Calendar';
import CalendarOverlay from './CalendarOverlay';

export function CalendarClient() {
    const [showOverlay, setShowOverlay] = useState(false);
    
    return (
        <div className="flex h-full flex-col">
            <header className="flex flex-none items-center justify-between border-b border-gray-200 px-6 py-4">
                <h1 className="text-base font-semibold leading-6 text-gray-900">
                    <time dateTime="2022-01">{new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}</time>
                </h1>
                <button onClick={() => setShowOverlay(true)} type="button" className="ml-6 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"> Add event </button>
            </header>

            <Calendar />
            {showOverlay && <CalendarOverlay setShowOverlay={setShowOverlay}/>}
        </div>
    );
}