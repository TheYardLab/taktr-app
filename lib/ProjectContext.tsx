import React, { createContext, useContext, useState, ReactNode } from 'react';

// 🔹 Task Type
export interface Task {
  label: string;
  trade: string;
  start: string | Date;
  finish: string | Date;
  duration: number;
  startDay?: number;
  finishDay?: number;
}

// 🔹 Handover Type
export interface Handover {
  from: string;
  to: string;
  day: number;
}

// 🔹 S-Curve Point Type
export interface SCurvePoint {
  day: number;
  progress: number;
  cumulative: number; // ✅ Added cumulative to match usage in scurveUtils
}

// 🔹 Project Context Type
interface ProjectContextType {
  scheduleData: Task[];
  setScheduleData: React.Dispatch<React.SetStateAction<Task[]>>;

  handovers: Handover[];
  setHandovers: React.Dispatch<React.SetStateAction<Handover[]>>;

  scurve: SCurvePoint[];
  setSCurve: React.Dispatch<React.SetStateAction<SCurvePoint[]>>;
}

// 🔹 Create Context
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// 🔹 Provider Component
export function ProjectProvider({ children }: { children: ReactNode }) {
  const [scheduleData, setScheduleData] = useState<Task[]>([]);
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [scurve, setSCurve] = useState<SCurvePoint[]>([]);

  return (
    <ProjectContext.Provider
      value={{
        scheduleData,
        setScheduleData,
        handovers,
        setHandovers,
        scurve,
        setSCurve,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

// 🔹 Hook to use the Project Context
export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}