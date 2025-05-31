
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../contexts/AssessmentContext';
import { X } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="wellness-gradient rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden shadow-xl relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-colors group"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-white group-hover:text-gray-200" />
        </button>
        
        <OnboardingFlow onClose={handleClose} />
      </div>
    </div>
  );
};

export default OnboardingWrapper;
