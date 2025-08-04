// lib/ProjectContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

/** =========================
 *  TYPES
 *  ========================= */

// ✅ Task type aligned with TaktPlan, UploadSchedule, Metrics, S-Curve
export type Task = {
  label: string;
  trade: string;
  startDay: number;
  finishDay: number;
  duration?: number;
  progress?: number;    // for s-curve calc
  completed?: boolean;  // for metrics
  notes?: string;       // extra details
};

// ✅ Handover type aligned with handoverUtils & Handover component
export type Handover = {
  fromTrade: string;
  toTrade: string;
  zone?: string;
  day: number; // explicit day of handover
};

// ✅ SCurvePoint type aligned with scurveUtils & SCurve component
export type SCurvePoint = {
  day: number;
  progress: number;
  cumulative: number;
};

// ✅ Metrics type aligned with metricsUtils
export type Metrics = {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  avgDuration: number;
};

/** =========================
 *  CONTEXT TYPE
 *  ========================= */

export type ProjectContextType = {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;

  handovers: Handover[];
  setHandovers: React.Dispatch<React.SetStateAction<Handover[]>>;

  scurve: SCurvePoint[];
  setSCurve: React.Dispatch<React.SetStateAction<SCurvePoint[]>>;

  metrics: Metrics;
  setMetrics: React.Dispatch<React.SetStateAction<Metrics>>;
};

/** =========================
 *  CONTEXT INITIALIZATION
 *  ========================= */

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

/** =========================
 *  PROVIDER
 *  ========================= */

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [scurve, setSCurve] = useState<SCurvePoint[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
    avgDuration: 0,
  });

  return (
    <ProjectContext.Provider
      value={{
        tasks,
        setTasks,
        handovers,
        setHandovers,
        scurve,
        setSCurve,
        metrics,
        setMetrics,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

/** =========================
 *  HOOK
 *  ========================= */

export function useProject(): ProjectContextType {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
}