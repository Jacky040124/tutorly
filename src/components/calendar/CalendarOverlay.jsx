import {useState} from 'react';
import { useUser } from '../providers/UserContext';
import DayField from '@/components/calendar/DayField';
import ErrorMessage from '@/components/common/ErrorMessage';
import { timeToDecimal } from '@/lib/utils/timeUtils';

const generateTimeOptions = () => {
    const options = [];
    options.push(<option key="default">Select Time</option>);
    
    for (let hour = 0; hour < 24; hour++) {
        const hourStr = hour.toString().padStart(2, '0');
        
        // Add hour:00
        options.push(
            <option key={`${hourStr}:00`}>{hourStr}:00</option>
        );
        
        // Add hour:30
        options.push(
            <option key={`${hourStr}:30`}>{hourStr}:30</option>
        );
    }
    
    return options;
};

export default function CalendarOverlay({ setShowOverlay, onEventAdded }) {
    const [date, setDate] = useState(null);
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const { user, availability, updateAvailability } = useUser();
    const [error, setError] = useState('');

    const handleCancel = () => {setShowOverlay(false)}
    const handleDate = (selectedDate) => {setDate(selectedDate);}
    const handleStart = (e) => {setStart(e.target.value)}
    const handleEnd = (e) => {setEnd(e.target.value)}

    const InputField = ({name, onChange, value}) => {
        return (
            <div>
                <label htmlFor="time" className="block text-sm font-medium leading-6 text-gray-900"> {name} </label>
                <select onChange={onChange} value={value} id="time" name="time" className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                    {generateTimeOptions()}
                </select>
            </div>
        )
    }

    const checkOverlap = (availability, newEvent) => {
        for (let i = 0; i < availability.length; i++) {
            const curEvent = availability[i];
            
            if (curEvent.date.year === newEvent.date.year && 
                curEvent.date.month === newEvent.date.month && 
                curEvent.date.day === newEvent.date.day) {
                if (
                    (newEvent.startTime >= curEvent.startTime && newEvent.startTime < curEvent.endTime) ||
                    (newEvent.endTime > curEvent.startTime && newEvent.endTime <= curEvent.endTime) ||
                    (newEvent.startTime <= curEvent.startTime && newEvent.endTime >= curEvent.endTime)
                ) {
                    return true;
                } 
            } 
        }
        return false;
    };

    const saveEvent = async (newEvent) => {
        if (!user?.uid) return;

        try {
            const updatedAvailability = [...availability, newEvent];
            await updateAvailability(updatedAvailability);
            
            if (onEventAdded) onEventAdded();
            setShowOverlay(false);
        } catch (error) {
            console.error('Error saving event:', error);
            setError(`Error saving event: ${error.message}`);
            throw error; // Re-throw to handle in calling function if needed
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        const startDecimal = timeToDecimal(start);
        const endDecimal = timeToDecimal(end);

        if (!date || !start || !end) {
            setError('Please fill in all fields');
            return;
        } else if (startDecimal >= endDecimal) {
            setError('End time must be later than start time');
            return;  
        }

        const newEvent = {
            date: {
                year: date.year,
                month: date.month,
                day: date.day
            },
            startTime: startDecimal,
            endTime: endDecimal
        };

        if (checkOverlap(availability, newEvent)) {
            setError('This time slot overlaps with an existing event');
            return;
        }

        await saveEvent(newEvent);
    };

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
            {error && <ErrorMessage message={error} />}
            <div>
                <div className="relative z-10" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
                    <div className="fixed inset-0"></div>

                    <div className="fixed inset-0 overflow-hidden">
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">

                                <div className="pointer-events-auto w-screen max-w-md">

                                    <form className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl">
                                        <div className="h-0 flex-1 overflow-y-auto">
                                            <div className="bg-indigo-700 px-4 py-6 sm:px-6 flex items-center justify-between">
                                                    <h2 className="text-base font-semibold leading-6 text-white" id="slide-over-title">New Event</h2>
                                                    <div className="ml-3 flex h-7 items-center">
                                                        <button onClick={handleCancel} type="button" className="rounded-md bg-indigo-700 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white">
                                                            <span className="sr-only">Close panel</span>
                                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                            </div>
                                            
                                            <div className="flex flex-1 flex-col justify-between">
                                                <div className="divide-y divide-gray-200 px-4 sm:px-6">
                                                    <div className="space-y-6 pb-5 pt-6">
                                                        <DayField onChange={handleDate} value={date}/>
                                                        <InputField onChange={handleStart} name="Start Time" value={start}/>
                                                        <InputField onChange={handleEnd} name="End Time" value={end}/>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-shrink-0 justify-end px-4 py-4">
                                            <button onClick={handleCancel} type="button" className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancel</button>
                                            <button onClick={handleSave} type="submit" className="ml-4 inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Save</button>
                                        </div>
                                    </form>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}


