
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../contexts/AssessmentContext';
import OnboardingFlow from './OnboardingFlow';

interface OnboardingWrapperProps {
  onClose: () => void;
}

const OnboardingWrapper = ({ onClose }: OnboardingWrapperProps) => {
  const navigate = useNavigate();
  const { responses } = useAssessment();

  const handleClose = () => {
    onClose();
    console.log('Onboarding closed');
  };

  // Check if assessment is complete and navigate to summary
  React.useEffect(() => {
    // You can add logic here to check if the assessment is complete
    // and navigate to summary when needed
  }, [responses, navigate]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <OnboardingFlow onClose={handleClose} />
      </div>
    </div>
  );
};

export default OnboardingWrapper;
