import {useState, useEffect} from 'react';
import { useUser } from './UserContext';
import { app, db, auth, doc, setDoc, getDoc } from '@/app/firebase';

export default function CalendarOverlay({ showOverlay, setShowOverlay }) {
    const [day, setDay] = useState("");
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [availability, setAvailability] = useState([]);
    const {user} = useUser();
    useEffect(() => {
        const fetchAvailability = async () => {
            if (user?.uid) {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                const availabilityData = docSnap.data()?.availability || [];
                setAvailability(availabilityData);
            }
        };
        
        fetchAvailability();
    }, [user]);

    const dayToNumber = {
        "Monday": 1,
        "Tuesday": 2,
        "Wednesday": 3,
        "Thursday": 4,
        "Friday": 5,
        "Saturday": 6,
        "Sunday": 7
    };

    const timeToDecimal = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours + (minutes / 60);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        const newEvent = {
            day: dayToNumber[day],
            startTime: timeToDecimal(start),
            endTime: timeToDecimal(end)
        };

        if (user?.uid) {
            const docRef = doc(db, "users", user.uid);
            const updatedAvailability = [...availability, newEvent];
            await setDoc(docRef, { availability: updatedAvailability }, { merge: true });
            setAvailability(updatedAvailability);
            setShowOverlay(false);
        }
    };

    const handleCancel = () => {setShowOverlay(false)}
    const handleDay = (e) => {setDay(e.target.value)}
    const handleStart = (e) => {setStart(e.target.value)}
    const handleEnd = (e) => {setEnd(e.target.value)}

    const InputField = ({name, onChange, value}) => {
        return (
            <div>
                <label htmlFor="time" className="block text-sm font-medium leading-6 text-gray-900"> {name} </label>
                <select onChange={onChange} value={value} id="time" name="time" className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
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

    const DayField = ({onChange, value}) => {
        return (
            <div>
                <label htmlFor="day" className="block text-sm font-medium leading-6 text-gray-900"> Day </label>
                <select onChange={onChange} value={value} id="day" name="day" className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                    <option>Monday</option>
                    <option>Tuesday</option>
                    <option>Wednesday</option>
                    <option>Thursday</option>
                    <option>Friday</option>
                    <option>Saturday</option>
                    <option>Sunday</option>
                </select>
            </div>
        )
    }

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
                                                    <DayField onChange={handleDay} value={day}/>
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


