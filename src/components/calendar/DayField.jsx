import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Logger } from '@/lib/utils/loggerUtil';

const logger = new Logger('DayField');

const DayField = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        logger.debug('Initializing DayField', { value });
        
        if (value) {
            try {
                const date = new Date(value.year, value.month - 1, value.day);
                setSelectedDate(date);
                logger.debug('Initial date set', { date });
            } catch (error) {
                logger.error('Failed to set initial date', error, { value });
            }
        }
    }, [value]);

    const handleDateSelect = (date) => {
        logger.debug('Date selection triggered', { date });
        
        if (!date) {
            logger.warn('Null date selected');
            return;
        }

        try {
            const dateObj = {
                day: date.getDate(),
                month: date.getMonth() + 1,
                year: date.getFullYear(),
                displayText: date.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric'
                })
            };

            logger.debug('Formatted date object', { dateObj });
            onChange(dateObj);
            setIsOpen(false);
        } catch (error) {
            logger.error('Failed to format date', error, { date });
        }
    };

    const handleButtonClick = () => {
        logger.debug('Button clicked', { wasOpen: isOpen });
        setIsOpen(!isOpen);
    };

    const minDate = new Date();
    logger.debug('Rendering with config', { 
        isOpen, 
        hasValue: !!value, 
        minDate,
        selectedDate 
    });

    return (
        <div className="relative">
            <button
                type="button"
                onClick={handleButtonClick}
                className="w-full text-left block appearance-none rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
                {value ? value.displayText : "Select day"}
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1">
                    <DatePicker
                        selected={selectedDate}
                        onChange={handleDateSelect}
                        inline
                        minDate={minDate}
                        calendarClassName="bg-white border rounded-lg shadow-lg"
                        dayClassName={date => 
                            "hover:bg-blue-50 rounded-full w-8 h-8 mx-auto flex items-center justify-center"
                        }
                        wrapperClassName="!block"
                        onClickOutside={() => {
                            logger.debug('Clicked outside calendar');
                            setIsOpen(false);
                        }}
                        onSelect={(date) => {
                            logger.debug('Date selected from calendar', { date });
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default DayField; 