import '../../lib/styles.css';
import {CalendarOverlay} from '@/components/CalendarOverlay'
import { app, db, auth, doc, setDoc, getDoc } from '@/app/firebase';
import { useUser } from './UserContext';
import { useState, useEffect } from 'react';

export default function Calendar() {
    const { user } = useUser();
    const [availability, setAvailability] = useState(null);
    const [weekOffset, setWeekOffset] = useState(0);
    const handleLastWeek = () => {setWeekOffset(prev => prev - 1);};
    const handleNextWeek = () => {setWeekOffset(prev => prev + 1);};

    useEffect(() => {
        const fetchAvailability = async () => {
            if (!user) return;
            
            try {
                const curUser = await getDoc(doc(db, 'users', user.uid));
                if (curUser?.data()?.availability) {
                    console.log('Fetched availability:', curUser.data().availability);
                    setAvailability(curUser.data().availability);
                }
            } catch (error) {
                console.error('Error fetching availability:', error);
            }
        };
        fetchAvailability();

    }, [user, weekOffset]);

    const currentDate = new Date();
    const today = currentDate.getDate();

    const Events = () => {
        if (!availability) return null;
        
        // Get current week's Monday and Sunday
        const getWeekBounds = () => {
            const curr = new Date();
            // Add offset weeks to current date
            curr.setDate(curr.getDate() + (weekOffset * 7));


            const monday = new Date(curr);
            const dayOfWeek = monday.getDay();
            const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            monday.setDate(monday.getDate() + diff);
            
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);

            console.log('Week bounds:', {
                monday: monday.toDateString(),
                sunday: sunday.toDateString(),
                weekOffset
            });

            return { monday, sunday };
        };

        const { monday, sunday } = getWeekBounds();
        
        const eventList = availability.map((event, index) => {
            // Check if event and event.date exist and have the required properties
            if (!event?.date?.year || !event?.date?.month || !event?.date?.day) {
                console.error('Invalid event date format:', event);
                return null;
            }
            
            // Convert event.date (object with day, month, year) to Date object
            const eventDate = new Date(event.date.year, event.date.month - 1, event.date.day);
            // Set time to midnight
            eventDate.setHours(0, 0, 0, 0);
            
            // Create copies of bounds with time set to midnight
            const mondayBound = new Date(monday);
            mondayBound.setHours(0, 0, 0, 0);
            const sundayBound = new Date(sunday);
            sundayBound.setHours(0, 0, 0, 0);
            
            if (eventDate >= mondayBound && eventDate <= sundayBound) {
                const weekday = eventDate.getDay();
                const adjustedWeekday = weekday === 0 ? 7 : weekday;
                
                return (
                    <EventDisplay 
                        key={index}
                        day={adjustedWeekday}
                        endTime={event.endTime}
                        startTime={event.startTime}
                    />
                );
            }
            return null;
        }).filter(Boolean);

        return (
            <ol className="col-start-1 col-end-2 row-start-1 grid grid-cols-1 sm:grid-cols-7 sm:pr-8" 
                style={{ gridTemplateRows: "1.75rem repeat(288, minmax(0, 1fr)) auto" }}>
                {eventList}
            </ol>
        );
    }
    
    
    const EventDisplay = ({day, startTime, endTime}) => {
        const numberToColStart = {
            1: 'sm:col-start-1',  // Monday
            2: 'sm:col-start-2',  // Tuesday
            3: 'sm:col-start-3',  // Wednesday
            4: 'sm:col-start-4',  // Thursday
            5: 'sm:col-start-5',  // Friday
            6: 'sm:col-start-6',  // Saturday
            7: 'sm:col-start-7'   // Sunday
        };

        const startRow = (startTime * 12) + 2;
        const EndRows = (endTime-startTime) * 12;

        console.log("day:" + day, "startTime:" + startTime,"endTime:" + endTime)
    
        return (
            <li className={`relative mt-px hidden ${numberToColStart[day]} sm:flex`} 
                style={{ gridRow: `${startRow} / span ${EndRows}` }}>
                <a className="group absolute inset-1 flex flex-col overflow-y-auto rounded-lg bg-green-100 p-2 text-xs leading-5 hover:bg-green-200">
                    <p className="text-gray-500 group-hover:text-gray-700">
                        <time dateTime={`2022-01-15T${startTime}:00`}>{startTime}:00</time>
                    </p>
                </a>
            </li>
        )
    }

    const VerticalGrid = () => {
        return (
        <div className={`col-start-1 col-end-2 row-start-1 hidden grid-cols-7 grid-rows-1 divide-x divide-gray-100 sm:grid sm:grid-cols-7`}>
            <div className="col-start-1 row-span-full"></div>
            <div className="col-start-2 row-span-full"></div>
            <div className="col-start-3 row-span-full"></div>
            <div className="col-start-4 row-span-full"></div>
            <div className="col-start-5 row-span-full"></div>
            <div className="col-start-6 row-span-full"></div>
            <div className="col-start-7 row-span-full"></div>
            <div className="col-start-8 row-span-full w-8"></div>
        </div>
        );
    };
    

    const WeekdayHeader = () => {
        // Get current week's Monday with offset
        const getMonday = (d) => {
            const date = new Date(d);
            // Add offset weeks to current date
            date.setDate(date.getDate() + (weekOffset * 7));
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1);
            return new Date(date.setDate(diff));
        };
        
        const monday = getMonday(new Date());
        
        // Generate dates for the week
        const weekDates = [...Array(7)].map((_, i) => {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            return date.getDate();
        });

        return (
            <div className="sticky top-0 z-30 flex-none bg-white shadow ring-1 ring-black ring-opacity-5 sm:pr-8">
                <div className="grid grid-cols-7 text-sm leading-6 text-gray-500 sm:hidden">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                        <button key={i} type="button" className="flex flex-col items-center pb-3 pt-2">
                            {day} 
                            <span className={`mt-1 flex h-8 w-8 items-center justify-center font-semibold ${
                                weekDates[i] === today ? 'rounded-full bg-indigo-600 text-white' : 'text-gray-900'
                            }`}>
                                {weekDates[i]}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="-mr-px hidden grid-cols-7 divide-x divide-gray-100 border-r border-gray-100 text-sm leading-6 text-gray-500 sm:grid">
                    <div className="col-end-1 w-14"></div>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                        <div key={i} className="flex items-center justify-center py-3">
                            <span className="flex items-baseline">
                                {day} 
                                <span className={`ml-1.5 ${
                                    weekDates[i] === today ? 'flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white' : 'items-center justify-center font-semibold text-gray-900'
                                }`}>
                                    {weekDates[i]}
                                </span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };


    return (
        <div className="flex h-full flex-col">

            <div className="isolate flex flex-auto flex-col overflow-auto bg-white">
                <div className="flex max-w-full flex-none flex-col sm:max-w-none md:max-w-full" style={{ width: "165%" }}>
                    <div className="flex justify-between items-center">
                        <button 
                            onClick={handleLastWeek}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Previous Week
                        </button>
                        <button 
                            onClick={handleNextWeek}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Next Week
                        </button>
                    </div>
                    <WeekdayHeader />

                    <div className="flex flex-auto">
                        <div className="sticky left-0 z-10 w-14 flex-none bg-white ring-1 ring-gray-100"></div>
                        <div className="grid flex-auto grid-cols-1 grid-rows-1">

                            <div className="col-start-1 col-end-2 row-start-1 grid divide-y divide-gray-100" style={{ gridTemplateRows: "repeat(48, minmax(3.5rem, 1fr))" }}>
                                <div className="row-end-1 h-7"></div>
                                <div> <div className="calendarText">12AM</div> </div>
                                <div> </div>
                                <div> <div className="calendarText">1AM</div> </div>
                                <div></div>
                                <div> <div className="calendarText">2AM</div> </div>
                                <div></div>
                                <div> <div className="calendarText">3AM</div> </div>
                                <div></div>
                                <div> <div className="calendarText">4AM</div> </div>
                                <div></div>
                                <div> <div className="calendarText">5AM</div> </div>
                                <div></div>
                                <div> <div className="calendarText">6AM</div> </div>
                                <div></div>
                                <div> <div className="calendarText">7AM</div> </div>
                                <div></div>
                                <div> <div className="calendarText">8AM</div> </div>
                                <div></div>
                                <div> <div className="calendarText">9AM</div> </div>
                                <div></div>
                                <div> <div className="calendarText">10AM</div> </div>
                                <div></div>
                                <div> <div className="calendarText">11AM</div> </div>
                                <div></div>
                                <div> <div className="calendarText">12PM</div> </div>
                                <div></div>
                                <div> <div className="calendarText">1PM</div> </div>
                                <div></div>
                                <div> <div className="calendarText">2PM</div> </div>
                                <div></div>
                                <div> <div className="calendarText">3PM</div> </div>
                                <div></div>
                                <div> <div className="calendarText">4PM</div> </div>
                                <div></div>
                                <div> <div className="calendarText">5PM</div> </div>
                                <div></div>
                                <div> <div className="calendarText">6PM</div> </div>
                                <div></div>
                                <div> <div className="calendarText">7PM</div> </div>
                                <div></div>
                                <div> <div className="calendarText">8PM</div> </div>
                                <div></div>
                                <div> <div className="calendarText">9PM</div> </div>
                                <div></div>
                                <div> <div className="calendarText">10PM</div> </div>
                                <div></div>
                                <div> <div className="calendarText">11PM</div> </div>
                                <div></div>
                            </div>

                            <VerticalGrid />

                            <Events/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}