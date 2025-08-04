'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// ✅ Types
export type Task = {
  label: string;
  trade: string;
  startDay: number;
  finishDay: number;
  duration?: number;
  progress?: number; // ✅ Added progress for SCurve calculation
  notes?: string;
};

export type Handover = {
  fromTrade: string;
  toTrade: string;
  zone?: string;
};

export type SCurvePoint = {
  day: number;
  progress: number;
  cumulative: number; // ✅ Added cumulative so SCurve build passes
};

// ✅ Context Type
export type ProjectContextType = {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  handovers: Handover[];
  setHandovers: React.Dispatch<React.SetStateAction<Handover[]>>;
  scurve: SCurvePoint[];
  setSCurve: React.Dispatch<React.SetStateAction<SCurvePoint[]>>;
};

// ✅ Default Context
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// ✅ Provider
export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [scurve, setSCurve] = useState<SCurvePoint[]>([]);

  return (
    <ProjectContext.Provider
      value={{ tasks, setTasks, handovers, setHandovers, scurve, setSCurve }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

// ✅ Hook
export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

// ✅ Exports
export type { Task as TaskType, Handover as HandoverType, SCurvePoint as SCurvePointType };