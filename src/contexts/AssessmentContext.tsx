
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AssessmentContextType {
  responses: Record<string, any>;
  updateResponses: (key: string, value: any) => void;
  completeAssessment: () => void;
  resetAssessment: () => void;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within AssessmentProvider');
  }
  return context;
};

export const AssessmentProvider = ({ children }: { children: ReactNode }) => {
  const [responses, setResponses] = useState<Record<string, any>>({});

  const updateResponses = (key: string, value: any) => {
    setResponses(prev => ({ ...prev, [key]: value }));
  };

  const completeAssessment = () => {
    console.log('Assessment completed with responses:', responses);
    // This will be called when the user finishes all questions
  };

  const resetAssessment = () => {
    setResponses({});
  };

  return (
    <AssessmentContext.Provider value={{
      responses,
      updateResponses,
      completeAssessment,
      resetAssessment
    }}>
      {children}
    </AssessmentContext.Provider>
  );
};
