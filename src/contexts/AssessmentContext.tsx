
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AssessmentContextType {
  responses: Record<string, any>;
  updateResponses: (key: string, value: any) => void;
  completeAssessment: () => void;
  resetAssessment: () => void;
  currentQuestionIndex: number;
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const navigate = useNavigate();

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
  };

  const resetAssessment = () => {
    console.log('AssessmentContext: Resetting assessment');
    setResponses({});
    setCurrentQuestionIndex(0);
  };

  return (
    <AssessmentContext.Provider value={{
      responses,
      updateResponses,
      completeAssessment,
      resetAssessment,
      currentQuestionIndex
    }}>
      {children}
    </AssessmentContext.Provider>
  );
};
