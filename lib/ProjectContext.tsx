import React, { createContext, useContext, useState, ReactNode } from 'react';

// 🔹 Types
export interface Task {
  label: string;
  trade: string;
  start: string | Date;
  finish: string | Date;
  duration: number;
  startDay?: number;
  name?: string;
}

export interface Handover {
  from: string;
  to: string;
  day: number;
}

export interface SCurvePoint {
  day: number;
  progress: number;
}

export interface ProjectContextType {
  scheduleData: Task[];
  setScheduleData: (tasks: Task[]) => void;
  handovers: Handover[];
  setHandovers: (handovers: Handover[]) => void;
  scurve: SCurvePoint[];
  setSCurve: (points: SCurvePoint[]) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [scheduleData, setScheduleData] = useState<Task[]>([]);
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [scurve, setSCurve] = useState<SCurvePoint[]>([]);

  return (
    <ProjectContext.Provider value={{ scheduleData, setScheduleData, handovers, setHandovers, scurve, setSCurve }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject(): ProjectContextType {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within a ProjectProvider');
  return context;
}