import React, { useState, useEffect } from 'react';

const DayField = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [availableDays, setAvailableDays] = useState([]);
    
    useEffect(() => {
        const getNext7Days = () => {
            const days = [];
            const today = new Date();
            
            for (let i = 0; i < 7; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                days.push({
                    day: date.getDate(),
                    month: date.getMonth() + 1,
                    year: date.getFullYear(),
                    displayText: date.toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric'
                    })
                });
            }
            return days;
        };

        setAvailableDays(getNext7Days());
    }, []);

    const handleDateSelect = (dateObj) => {
        onChange({
            day: dateObj.day,
            month: dateObj.month,
            year: dateObj.year,
            displayText: dateObj.displayText
        });
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full text-left">
                {value ? value.displayText : "Select day"}
            </button>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg">
                    {availableDays.map((dateObj) => (
                        <div 
                            key={`${dateObj.year}-${dateObj.month}-${dateObj.day}`}
                            onClick={() => handleDateSelect(dateObj)} 
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                        >
                            {dateObj.displayText}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DayField; 