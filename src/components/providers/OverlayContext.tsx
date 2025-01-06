"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface OverlayContextType {
  showTeacherProfileOverlay: boolean;
  setShowTeacherProfileOverlay: (show: boolean) => void;
  showAddEventOverlay: boolean;
  setShowAddEventOverlay: (show: boolean) => void;
  showStudentProfileOverlay: boolean;
  setShowStudentProfileOverlay: (show: boolean) => void;
}

const OverlayContext = createContext<OverlayContextType>({} as OverlayContextType);

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [showTeacherProfileOverlay, setShowTeacherProfileOverlay] = useState(false);
  const [showAddEventOverlay, setShowAddEventOverlay] = useState(false);
  const [showStudentProfileOverlay, setShowStudentProfileOverlay] = useState(false);

  return (
    <OverlayContext.Provider
      value={{
        showTeacherProfileOverlay,
        setShowTeacherProfileOverlay,
        showAddEventOverlay,
        setShowAddEventOverlay,
        showStudentProfileOverlay,
        setShowStudentProfileOverlay,
      }}
    >
      {children}
    </OverlayContext.Provider>
  );
}

export const useOverlay = () => useContext(OverlayContext);
