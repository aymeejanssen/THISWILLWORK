
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../contexts/AssessmentContext';
import OnboardingFlow from './OnboardingFlow';

const OnboardingWrapper = () => {
  const navigate = useNavigate();
  const { updateResponses } = useAssessment();

  // This component wraps the OnboardingFlow and handles completion
  const handleComplete = (allResponses: Record<string, any>) => {
    console.log('Onboarding completed with responses:', allResponses);
    
    // Update the assessment context with all responses
    Object.keys(allResponses).forEach(key => {
      updateResponses(key, allResponses[key]);
    });

    // Navigate to summary page
    navigate('/summary');
  };

  return <OnboardingFlow onComplete={handleComplete} />;
};

export default OnboardingWrapper;
