
import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate, useLocation } from 'react-router-dom';
import OnboardingFlow from '../components/OnboardingFlow';

const Assessment = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleClose = () => {
    setIsOpen(false);
    // Check if we came from the competition page, otherwise default to index
    const returnTo = location.state?.returnTo || '/';
    navigate(returnTo);
  };

  return (
    <div className="min-h-screen wellness-gradient">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
          <OnboardingFlow onClose={handleClose} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Assessment;
