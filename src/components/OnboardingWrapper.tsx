
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../contexts/AssessmentContext';
import OnboardingFlow from './OnboardingFlow';

interface OnboardingWrapperProps {
  onClose: () => void;
}

const OnboardingWrapper = ({ onClose }: OnboardingWrapperProps) => {
  const navigate = useNavigate();
  const { completeAssessment } = useAssessment();

  const handleClose = () => {
    console.log('OnboardingWrapper: handleClose called');
    onClose();
  };

  const handleAssessmentComplete = () => {
    console.log('OnboardingWrapper: Assessment completion started');
    completeAssessment();
    console.log('OnboardingWrapper: completeAssessment called');
    onClose(); // Close the modal
    console.log('OnboardingWrapper: modal closed');
    navigate('/assessment-summary'); // Navigate to summary page
    console.log('OnboardingWrapper: navigating to /assessment-summary');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <OnboardingFlow onClose={handleAssessmentComplete} />
      </div>
    </div>
  );
};

export default OnboardingWrapper;
