import {useState} from 'react';
import { useUser } from './UserContext';
import DayField from '@/components/DayField';

const timeToDecimal = (time) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':').map(Number);
    return hours + (minutes / 60);
};

export default function CalendarOverlay({ setShowOverlay, onEventAdded }) {
    const [date, setDate] = useState(null);
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const { user, availability, updateAvailability } = useUser();

    const handleCancel = () => {setShowOverlay(false)}
    const handleDate = (selectedDate) => {setDate(selectedDate);}
    const handleStart = (e) => {setStart(e.target.value)}
    const handleEnd = (e) => {setEnd(e.target.value)}

    const InputField = ({name, onChange, value}) => {
        return (
            <div>
                <label htmlFor="time" className="block text-sm font-medium leading-6 text-gray-900"> {name} </label>
                <select onChange={onChange} value={value} id="time" name="time" className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                    <option>Select Time</option>
                    <option>00:00</option>
                    <option>00:30</option>
                    <option>01:00</option>
                    <option>01:30</option>
                    <option>02:00</option>
                    <option>02:30</option>
                    <option>03:00</option>
                    <option>03:30</option>
                    <option>04:00</option>
                    <option>04:30</option>
                    <option>05:00</option>
                    <option>05:30</option>
                    <option>06:00</option>
                    <option>06:30</option>
                    <option>07:00</option>
                    <option>07:30</option>
                    <option>08:00</option>
                    <option>08:30</option>
                    <option>09:00</option>
                    <option>09:30</option>
                    <option>10:00</option>
                    <option>10:30</option>
                    <option>11:00</option>
                    <option>11:30</option>
                    <option>12:00</option>
                    <option>12:30</option>
                    <option>13:00</option>
                    <option>13:30</option>
                    <option>14:00</option>
                    <option>14:30</option>
                    <option>15:00</option>
                    <option>15:30</option>
                    <option>16:00</option>
                    <option>16:30</option>
                    <option>17:00</option>
                    <option>17:30</option>
                    <option>18:00</option>
                    <option>18:30</option>
                    <option>19:00</option>
                    <option>19:30</option>
                    <option>20:00</option>
                    <option>20:30</option>
                    <option>21:00</option>
                    <option>21:30</option>
                    <option>22:00</option>
                    <option>22:30</option>
                    <option>23:00</option>
                    <option>23:30</option>
                </select>
            </div>
        )
    }

    const handleSave = async (e) => {
        e.preventDefault();

        const startDecimal = timeToDecimal(start);
        const endDecimal = timeToDecimal(end);

        if (!date || !start || !end) {
            console.error('Missing required fields:', { date, start, end });
            alert('Please fill in all fields');
            return;
        } else if (startDecimal >= endDecimal) {
            alert('endTime Must be later than startTime');
            return;  
        }

        // Create date object using the values from the date object directly
        const newEvent = {
            date: {
                year: date.year,
                month: date.month,
                day: date.day
            },
            startTime: startDecimal,
            endTime: endDecimal
        };

        // Check for overlapping events
        for (let i = 0; i < availability.length; i++) {
            const curEvent = availability[i];
            
            // Compare year, month, and day separately
            if (curEvent.date.year === newEvent.date.year && 
                curEvent.date.month === newEvent.date.month && 
                curEvent.date.day === newEvent.date.day) {
                if (
                    (newEvent.startTime >= curEvent.startTime && newEvent.startTime < curEvent.endTime) ||
                    (newEvent.endTime > curEvent.startTime && newEvent.endTime <= curEvent.endTime) ||
                    (newEvent.startTime <= curEvent.startTime && newEvent.endTime >= curEvent.endTime)
                ) {
                    alert('This time slot overlaps with an existing event');
                    return;
                } 
            } 
        }

        if (user?.uid) {
            try {
                const updatedAvailability = [...availability, newEvent];
                await updateAvailability(updatedAvailability);
                
                // Call onEventAdded before closing overlay
                if (onEventAdded) onEventAdded();
                setShowOverlay(false);
            } catch (error) {
                console.error('Error saving event:', error);
                alert('Error saving event. Please try again.');
            }
        }
    };

    return (
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
    )

}


