
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
    console.log('AssessmentContext: Updating responses', { key, value });
    setResponses(prev => {
      const updated = { ...prev, [key]: value };
      console.log('AssessmentContext: Updated responses:', updated);
      return updated;
    });
  };

  const completeAssessment = () => {
    console.log('AssessmentContext: Assessment completed with responses:', responses);
    // This will be called when the user finishes all questions
  };

  const resetAssessment = () => {
    console.log('AssessmentContext: Resetting assessment');
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
