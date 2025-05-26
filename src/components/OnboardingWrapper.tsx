
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../contexts/AssessmentContext';
import OnboardingFlow from './OnboardingFlow';

const OnboardingWrapper = () => {
  const navigate = useNavigate();
  const { responses } = useAssessment();

  const handleClose = () => {
    // Handle closing the onboarding flow if needed
    console.log('Onboarding closed');
  };

  // Check if assessment is complete and navigate to summary
  React.useEffect(() => {
    // You can add logic here to check if the assessment is complete
    // and navigate to summary when needed
  }, [responses, navigate]);

  return <OnboardingFlow onClose={handleClose} />;
};

export default OnboardingWrapper;
