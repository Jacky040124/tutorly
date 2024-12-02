"use client";

import { createContext, useContext, useState, useEffect } from "react";

const OverlayContext = createContext();

export function OverlayProvider({ children }) {
const [showCalendarOverlay, setShowCalendarOverlay] = useState(false);
const [showTeacherProfileOverlay, setShowTeacherProfileOverlay] = useState(false);
const [showStudentProfileOverlay, setShowStudentProfileOverlay] = useState(false);

// Add a useEffect to monitor state changes
useEffect(() => {
  console.log('showCalendarOverlay state changed:', showCalendarOverlay);
}, [showCalendarOverlay]);

useEffect(() => {
  console.log('showTeacherProfileOverlay state changed:', showTeacherProfileOverlay);
}, [showTeacherProfileOverlay]);

  const value = {
    showCalendarOverlay,
    setShowCalendarOverlay,
    showTeacherProfileOverlay,
    setShowTeacherProfileOverlay,
    showStudentProfileOverlay,
    setShowStudentProfileOverlay,
  };

  return <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>;
}

export function useOverlay() {
  const context = useContext(OverlayContext);
  if (context === undefined) {
    throw new Error("useOverlay must be used within an OverlayProvider");
  }
  return context;
}
