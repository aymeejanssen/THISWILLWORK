
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import OnboardingWrapper from "../components/OnboardingWrapper";

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleBeginJourney = () => {
    setShowOnboarding(true);
  };

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Main Website Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to MindEase
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your journey to mental wellness starts here. Take our personalized assessment 
            to discover the best path forward for your mental health journey.
          </p>
          <Button 
            onClick={handleBeginJourney}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            Begin My Journey
          </Button>
        </div>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="text-xl font-semibold mb-4">Personalized Assessment</h3>
            <p className="text-gray-600">
              Take our comprehensive assessment to understand your mental health needs.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="text-xl font-semibold mb-4">Expert Guidance</h3>
            <p className="text-gray-600">
              Get matched with qualified therapists and mental health professionals.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="text-xl font-semibold mb-4">Global Support</h3>
            <p className="text-gray-600">
              Access mental health resources and support from anywhere in the world.
            </p>
          </div>
        </div>
      </div>

      {/* Onboarding Modal/Popup */}
      {showOnboarding && (
        <OnboardingWrapper onClose={handleCloseOnboarding} />
      )}
    </div>
  );
};

export default Index;
