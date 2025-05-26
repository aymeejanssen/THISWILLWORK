
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
    onClose();
    console.log('Onboarding closed');
  };

  const handleAssessmentComplete = () => {
    completeAssessment();
    onClose(); // Close the modal
    navigate('/assessment-summary'); // Navigate to summary page
  };

  // Listen for when the onboarding flow is completed
  React.useEffect(() => {
    const handleOnboardingComplete = () => {
      handleAssessmentComplete();
    };

    // We'll trigger completion when the user finishes the flow
    // For now, we'll use a simple approach where OnboardingFlow calls onClose when done
    return () => {};
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <OnboardingFlow onClose={handleAssessmentComplete} />
      </div>
    </div>
  );
};

export default OnboardingWrapper;
