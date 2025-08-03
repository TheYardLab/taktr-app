import { createContext, useState, useContext, ReactNode } from 'react';

type Handover = {
  from: string;
  to: string;
  day: number;
};

type ProjectContextType = {
  scheduleData: any[];
  handovers: Handover[];
  setScheduleData: (data: any[]) => void;
  setHandovers: (handover: Handover[]) => void;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [handovers, setHandovers] = useState<Handover[]>([]);

  return (
    <ProjectContext.Provider value={{ scheduleData, handovers, setScheduleData, setHandovers }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
};