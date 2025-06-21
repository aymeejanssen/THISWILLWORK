
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Heart, Shield, Users, Globe } from 'lucide-react';
import { useAssessment } from '../contexts/AssessmentContext';

const OnboardingFlow = ({ onClose }: { onClose: () => void }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    location: '',
    primaryConcern: '',
    supportType: '',
    previousTherapy: '',
    culturalBackground: '',
    languages: '',
    goals: ''
  });

  const navigate = useNavigate();
  const { updateResponses } = useAssessment();

  const steps = [
    {
      title: "Welcome to Your Wellness Journey",
      description: "Let's get to know you better so we can provide personalized support",
      icon: <Heart className="h-6 w-6 text-purple-600" />
    },
    {
      title: "Tell Us About Yourself",
      description: "Basic information to help us understand your background",
      icon: <Users className="h-6 w-6 text-purple-600" />
    },
    {
      title: "Your Support Preferences",
      description: "How would you like to receive support and guidance?",
      icon: <Shield className="h-6 w-6 text-purple-600" />
    },
    {
      title: "Cultural & Language Preferences",
      description: "Help us provide culturally-aware support",
      icon: <Globe className="h-6 w-6 text-purple-600" />
    },
    {
      title: "Your Wellness Goals",
      description: "What would you like to achieve on this journey?",
      icon: <Heart className="h-6 w-6 text-purple-600" />
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save all form data to assessment context
      Object.entries(formData).forEach(([key, value]) => {
        updateResponses(key, value);
      });
      
      // Close onboarding and navigate to assessment
      onClose();
      navigate('/assessment');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <Heart className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Welcome to MindEase
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We're here to support your mental wellness journey with culturally-aware, 
                personalized guidance. This brief setup will help us understand how to best support you.
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-purple-800 text-sm">
                ✨ Your responses are private and secure
              </p>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">What should we call you?</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="Your preferred name"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="age">Age (optional)</Label>
              <Input
                id="age"
                value={formData.age}
                onChange={(e) => updateFormData('age', e.target.value)}
                placeholder="Your age"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="location">Location (optional)</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => updateFormData('location', e.target.value)}
                placeholder="City, Country"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="primaryConcern">What brings you here today?</Label>
              <Textarea
                id="primaryConcern"
                value={formData.primaryConcern}
                onChange={(e) => updateFormData('primaryConcern', e.target.value)}
                placeholder="Share what's on your mind or what you'd like support with..."
                className="mt-2"
                rows={3}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">What type of support are you looking for?</Label>
              <RadioGroup
                value={formData.supportType}
                onValueChange={(value) => updateFormData('supportType', value)}
                className="mt-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="emotional" id="emotional" />
                  <Label htmlFor="emotional">Emotional support and listening</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="practical" id="practical" />
                  <Label htmlFor="practical">Practical coping strategies</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="both" />
                  <Label htmlFor="both">Both emotional and practical support</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="exploring" id="exploring" />
                  <Label htmlFor="exploring">I'm exploring what I need</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label className="text-base font-medium">Have you tried therapy or counseling before?</Label>
              <RadioGroup
                value={formData.previousTherapy}
                onValueChange={(value) => updateFormData('previousTherapy', value)}
                className="mt-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes-helpful" id="yes-helpful" />
                  <Label htmlFor="yes-helpful">Yes, and it was helpful</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes-mixed" id="yes-mixed" />
                  <Label htmlFor="yes-mixed">Yes, but results were mixed</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no-interested" id="no-interested" />
                  <Label htmlFor="no-interested">No, but I'm interested</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no-barriers" id="no-barriers" />
                  <Label htmlFor="no-barriers">No, due to barriers (cost, access, etc.)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="culturalBackground">Cultural background (optional)</Label>
              <Input
                id="culturalBackground"
                value={formData.culturalBackground}
                onChange={(e) => updateFormData('culturalBackground', e.target.value)}
                placeholder="e.g., Mexican-American, British-Pakistani, etc."
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                This helps us provide culturally-sensitive support
              </p>
            </div>
            <div>
              <Label htmlFor="languages">Languages you're comfortable with</Label>
              <Input
                id="languages"
                value={formData.languages}
                onChange={(e) => updateFormData('languages', e.target.value)}
                placeholder="e.g., English, Spanish, Arabic"
                className="mt-2"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="goals">What would you like to achieve? (optional)</Label>
              <Textarea
                id="goals"
                value={formData.goals}
                onChange={(e) => updateFormData('goals', e.target.value)}
                placeholder="e.g., better manage anxiety, improve relationships, build confidence..."
                className="mt-2"
                rows={4}
              />
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800 text-sm">
                🌱 You're all set! Your wellness assessment will be personalized based on your responses.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center border-b">
          <div className="flex items-center justify-center gap-3 mb-4">
            {steps[currentStep].icon}
            <CardTitle className="text-xl">{steps[currentStep].title}</CardTitle>
          </div>
          <p className="text-gray-600">{steps[currentStep].description}</p>
          
          {/* Progress Bar */}
          <div className="flex gap-2 mt-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-purple-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          {renderStepContent()}
          
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={currentStep === 0 ? onClose : handlePrevious}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {currentStep === 0 ? 'Close' : 'Previous'}
            </Button>
            
            <Button
              onClick={handleNext}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              {currentStep === steps.length - 1 ? 'Start Assessment' : 'Next'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingFlow;
