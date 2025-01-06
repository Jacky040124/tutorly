"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getWeekBounds } from '../../lib/utils/timeUtils';

interface CalendarContextType {
  weekOffset: number;
  setWeekOffset: React.Dispatch<React.SetStateAction<number>>;
  getDisplayMonth: () => string;
}

const CalendarContext = createContext<CalendarContextType | null>(null);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [weekOffset, setWeekOffset] = useState(0);
  
  const getDisplayMonth = () => {
    const { monday, sunday } = getWeekBounds(weekOffset);
    const mondayDate = new Date(monday.year, monday.month - 1, monday.day);
    const sundayDate = new Date(sunday.year, sunday.month - 1, sunday.day);
    
    if (mondayDate.getMonth() === sundayDate.getMonth()) {
      return mondayDate.toLocaleString("default", { month: "long" });
    }
    
    return `${mondayDate.toLocaleString("default", { month: "long" })} - ${sundayDate.toLocaleString("default", { month: "long" })}`;
  };

  const value = {
    weekOffset,
    setWeekOffset,
    getDisplayMonth
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
}; 