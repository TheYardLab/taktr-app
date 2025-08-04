'use client';

import React, { createContext, useContext, useState, type ReactNode } from 'react';

export type Task = {
  label: string;
  trade: string;
  startDay: number;
  finishDay: number;
  notes?: string;
};

export type Handover = {
  fromTrade: string;
  toTrade: string;
  zone: string;
};

export type SCurvePoint = {
  day: number;
  progress: number;
  cumulative: number;
};

export type ProjectContextType = {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  handovers: Handover[];
  setHandovers: React.Dispatch<React.SetStateAction<Handover[]>>;
  scurve: SCurvePoint[];
  setSCurve: React.Dispatch<React.SetStateAction<SCurvePoint[]>>;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [scurve, setSCurve] = useState<SCurvePoint[]>([]);

  return (
    <ProjectContext.Provider value={{ tasks, setTasks, handovers, setHandovers, scurve, setSCurve }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used inside ProjectProvider');
  return context;
}