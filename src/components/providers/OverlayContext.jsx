"use client";

import { createContext, useContext, useState } from "react";

const OverlayContext = createContext();

export function OverlayProvider({ children }) {
const [showCalendarOverlay, setShowCalendarOverlay] = useState(false);
const [showTeacherProfileOverlay, setShowTeacherProfileOverlay] = useState(false);


  const value = {
    showCalendarOverlay,
    setShowCalendarOverlay,
    showTeacherProfileOverlay,
    setShowTeacherProfileOverlay,
  };

  return <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>;
}

export function useOverlay() {
  const context = useContext(OverlayContext);
  if (context === undefined) {
    throw new Error("booking context not wrapped properly");
  }
  return context;
}
