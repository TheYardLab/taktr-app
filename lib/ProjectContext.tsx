'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Task {
  label: string;
  trade: string;
  startDay: number;
  finishDay: number;
  duration: number;
  notes?: string;
  completed?: boolean;
}

export interface Handover {
  fromTrade: string;
  toTrade: string;
  zone: string;
  day: number;
}

export interface SCurvePoint {
  day: number;
  progress: number;
}

export interface Metrics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  avgDuration: number;
}

interface ProjectContextType {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  handovers: Handover[];
  setHandovers: React.Dispatch<React.SetStateAction<Handover[]>>;
  scurve: SCurvePoint[];
  setSCurve: React.Dispatch<React.SetStateAction<SCurvePoint[]>>;
  metrics: Metrics;
  setMetrics: React.Dispatch<React.SetStateAction<Metrics>>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [scurve, setSCurve] = useState<SCurvePoint[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
    avgDuration: 0
  });

  return (
    <ProjectContext.Provider value={{ tasks, setTasks, handovers, setHandovers, scurve, setSCurve, metrics, setMetrics }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within ProjectProvider');
  return context;
};