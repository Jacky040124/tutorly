import '../../lib/styles.css';
import { app, db, auth, doc, setDoc, getDoc } from '@/app/firebase';
import { useUser } from './UserContext';
import { useState, useEffect } from 'react';

export default function Calendar() {
    const { user } = useUser();
    const [availability, setAvailability] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

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

    }, [user, refreshTrigger]);

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.toLocaleString('default', { month: 'long' });
    const today = currentDate.getDate();

    const Events = () => {
        if (!availability) return null;
        
        const eventList = availability.map((event, index) => {
            console.log(`Event ${index} before render:`, {
                day: event.day,
                startTime: event.startTime,
                endTime: event.endTime,
            });
            
            return (
                <EventDisplay 
                    key={index}
                    day={event.day}
                    endTime={event.endTime}
                    startTime={event.startTime}
                />
            );
        });

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
        return (

            <div className="sticky top-0 z-30 flex-none bg-white shadow ring-1 ring-black ring-opacity-5 sm:pr-8">
            <div className="grid grid-cols-7 text-sm leading-6 text-gray-500 sm:hidden">
                <button type="button" className="flex flex-col items-center pb-3 pt-2">M <span className="mt-1 flex h-8 w-8 items-center justify-center font-semibold text-gray-900">10</span></button>
                <button type="button" className="flex flex-col items-center pb-3 pt-2">T <span className="mt-1 flex h-8 w-8 items-center justify-center font-semibold text-gray-900">11</span></button>
                <button type="button" className="flex flex-col items-center pb-3 pt-2">W <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white">12</span></button>
                <button type="button" className="flex flex-col items-center pb-3 pt-2">T <span className="mt-1 flex h-8 w-8 items-center justify-center font-semibold text-gray-900">13</span></button>
                <button type="button" className="flex flex-col items-center pb-3 pt-2">F <span className="mt-1 flex h-8 w-8 items-center justify-center font-semibold text-gray-900">14</span></button>
                <button type="button" className="flex flex-col items-center pb-3 pt-2">S <span className="mt-1 flex h-8 w-8 items-center justify-center font-semibold text-gray-900">15</span></button>
                <button type="button" className="flex flex-col items-center pb-3 pt-2">S <span className="mt-1 flex h-8 w-8 items-center justify-center font-semibold text-gray-900">16</span></button>
            </div>

            <div className="-mr-px hidden grid-cols-7 divide-x divide-gray-100 border-r border-gray-100 text-sm leading-6 text-gray-500 sm:grid">
                <div className="col-end-1 w-14"></div>
                <div className="flex items-center justify-center py-3">
                    <span>Mon <span className="items-center justify-center font-semibold text-gray-900">{today}</span></span>
                </div>
                <div className="flex items-center justify-center py-3">
                    <span>Tue <span className="items-center justify-center font-semibold text-gray-900">{today+1}</span></span>
                </div>
                <div className="flex items-center justify-center py-3">
                    <span className="flex items-baseline">Wed <span className="ml-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white">{today+2}</span></span>
                </div>
                <div className="flex items-center justify-center py-3">
                    <span>Thu <span className="items-center justify-center font-semibold text-gray-900">{today+3}</span></span>
                </div>
                <div className="flex items-center justify-center py-3">
                    <span>Fri <span className="items-center justify-center font-semibold text-gray-900">{today+4}</span></span>
                </div>
                <div className="flex items-center justify-center py-3">
                    <span>Sat <span className="items-center justify-center font-semibold text-gray-900">{today+5}</span></span>
                </div>
                <div className="flex items-center justify-center py-3">
                    <span>Sun <span className="items-center justify-center font-semibold text-gray-900">{today+6}</span></span>
                </div>
            </div>
        </div>
        );
    };


    return (
        <div className="flex h-full flex-col">

            <div className="isolate flex flex-auto flex-col overflow-auto bg-white">
                <div className="flex max-w-full flex-none flex-col sm:max-w-none md:max-w-full" style={{ width: "165%" }}>
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