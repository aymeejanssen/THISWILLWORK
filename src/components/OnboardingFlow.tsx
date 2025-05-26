
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Heart, X, ArrowRight, ArrowLeft, AlertTriangle } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";

interface OnboardingFlowProps {
  onClose: () => void;
}

interface UserProfile {
  name: string;
  age: string;
  gender: string;
  culture: string;
  preferredLanguage: string;
  location: string;
  hasDiagnosedCondition: string;
  diagnosedConditions: string;
  primaryPainPoint: string;
  emotionallyMissing: string;
  stuckPatterns: string;
  overwhelmedEasily: string;
  parentRelationship: string;
  homeEnvironment: string;
  parentAvailability: string;
  feltSeenHeard: string;
  parentFighting: string;
  divorceAbandonment: string;
  physicalPunishment: string;
  verbalAbuse: string;
  homeAddictionMentalIllness: string;
  fearedSafety: string;
  neverGoodEnough: string;
  bulliedExcluded: string;
  pressuredToHide: string;
  identityShame: string;
  publicHumiliation: string;
  completelyAlone: string;
  allowedToCry: string;
  feelingsDismissed: string;
  stayedQuiet: string;
  parentedParents: string;
  handlesSadness: string;
  closeLoss: string;
  sexualAbuse: string;
  witnessedViolence: string;
  lifeThreatening: string;
  madeFeelWorthless: string;
  trustStruggle: string;
  fearAbandonment: string;
  feelNotEnough: string;
  afraidToFeel: string;
  disconnectedFromSelf: string;
  attractToxicPeople: string;
  overcompensate: string;
  boundaryGuilt: string;
  hardToLove: string;
  pastControlsPresent: string;
  anxiousWhenFine: string;
  criticismAttacks: string;
  shutDownConflict: string;
  feelNumb: string;
  cryingPatterns: string;
  innerCritic: string;
  doubtGoodThings: string;
  complimentsUncomfortable: string;
  guiltyWhenNo: string;
  feelBurden: string;
  fearPeopleLeave: string;
  fallForBadTreatment: string;
  stayUnhappy: string;
  overExplainEmotions: string;
  givingVsReceiving: string;
  hardToRelax: string;
  proveWorthThroughWork: string;
  busyToAvoidThoughts: string;
  perfectionism: string;
  avoidWithoutKnowing: string;
}

const OnboardingFlow = ({ onClose }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [canProceed, setCanProceed] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    age: '',
    gender: '',
    culture: '',
    preferredLanguage: '',
    location: '',
    hasDiagnosedCondition: '',
    diagnosedConditions: '',
    primaryPainPoint: '',
    emotionallyMissing: '',
    stuckPatterns: '',
    overwhelmedEasily: '',
    parentRelationship: '',
    homeEnvironment: '',
    parentAvailability: '',
    feltSeenHeard: '',
    parentFighting: '',
    divorceAbandonment: '',
    physicalPunishment: '',
    verbalAbuse: '',
    homeAddictionMentalIllness: '',
    fearedSafety: '',
    neverGoodEnough: '',
    bulliedExcluded: '',
    pressuredToHide: '',
    identityShame: '',
    publicHumiliation: '',
    completelyAlone: '',
    allowedToCry: '',
    feelingsDismissed: '',
    stayedQuiet: '',
    parentedParents: '',
    handlesSadness: '',
    closeLoss: '',
    sexualAbuse: '',
    witnessedViolence: '',
    lifeThreatening: '',
    madeFeelWorthless: '',
    trustStruggle: '',
    fearAbandonment: '',
    feelNotEnough: '',
    afraidToFeel: '',
    disconnectedFromSelf: '',
    attractToxicPeople: '',
    overcompensate: '',
    boundaryGuilt: '',
    hardToLove: '',
    pastControlsPresent: '',
    anxiousWhenFine: '',
    criticismAttacks: '',
    shutDownConflict: '',
    feelNumb: '',
    cryingPatterns: '',
    innerCritic: '',
    doubtGoodThings: '',
    complimentsUncomfortable: '',
    guiltyWhenNo: '',
    feelBurden: '',
    fearPeopleLeave: '',
    fallForBadTreatment: '',
    stayUnhappy: '',
    overExplainEmotions: '',
    givingVsReceiving: '',
    hardToRelax: '',
    proveWorthThroughWork: '',
    busyToAvoidThoughts: '',
    perfectionism: '',
    avoidWithoutKnowing: ''
  });

  const updateProfile = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    
    if (field === 'hasDiagnosedCondition' && value === 'yes') {
      setShowWarning(true);
      setCanProceed(false);
    } else if (field === 'hasDiagnosedCondition' && value === 'no') {
      setShowWarning(false);
      setCanProceed(true);
    }
  };

  const steps = [
    {
      title: "Before We Begin",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-gray-700 leading-relaxed">
            To provide personalized support, we need to understand your background, challenges, and cultural context. All information is confidential and encrypted. You may skip any uncomfortable questions.
          </p>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800 mb-2">
                  Have you been diagnosed with a mental health condition by a doctor or licensed therapist?
                </p>
                <p className="text-sm text-yellow-700">
                  (Examples: depression, anxiety disorder, PTSD, bipolar disorder, etc.)
                </p>
              </div>
            </div>
          </div>
          
          <RadioGroup value={profile.hasDiagnosedCondition} onValueChange={(value) => updateProfile('hasDiagnosedCondition', value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="diagnosed-yes" />
              <Label htmlFor="diagnosed-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="diagnosed-no" />
              <Label htmlFor="diagnosed-no">No / I'm not sure</Label>
            </div>
          </RadioGroup>

          {profile.hasDiagnosedCondition === 'yes' && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-800 mb-2">We're really glad you're here.</p>
                  <p className="text-red-700 mb-3">
                    This app is not a replacement for therapy, medical care, or crisis support.
                    It's a digital companion that offers emotional guidance when you need it most—whether it's 2am, a tough day at work, or just a moment when you need someone to talk to.
                  </p>
                  <p className="text-red-700 mb-3">
                    You can think of this app as a kind friend who:
                  </p>
                  <ul className="text-red-700 mb-3 list-disc list-inside">
                    <li>Helps you reflect and process emotions</li>
                    <li>Offers coping tools, exercises, and ideas</li>
                    <li>Remembers emotional patterns (if you choose)</li>
                    <li>Listens without judgment</li>
                  </ul>
                  <p className="text-red-700 mb-3">
                    Please continue only if you understand that this app is not therapy and is not suitable for clinical mental health care.
                  </p>
                  <Button 
                    size="sm" 
                    onClick={() => setCanProceed(true)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    I Understand, Continue
                  </Button>
                </div>
              </div>
            </div>
          )}

          {profile.hasDiagnosedCondition === 'no' && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-green-800">
                Welcome. This space is here to help you feel supported, heard, and understood.
                It's not therapy, but it can help you explore your emotions, reflect on patterns, and feel less alone.
              </p>
            </div>
          )}
        </div>
      )
    },
    {
      title: "Basic Information",
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">What would you like us to call you?</Label>
            <Select value={profile.name} onValueChange={(value) => updateProfile('name', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a name" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alex">Alex</SelectItem>
                <SelectItem value="sam">Sam</SelectItem>
                <SelectItem value="jordan">Jordan</SelectItem>
                <SelectItem value="taylor">Taylor</SelectItem>
                <SelectItem value="casey">Casey</SelectItem>
                <SelectItem value="riley">Riley</SelectItem>
                <SelectItem value="morgan">Morgan</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="age">Your age range</Label>
            <RadioGroup value={profile.age} onValueChange={(value) => updateProfile('age', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="18-25" id="age1" />
                <Label htmlFor="age1">18-25</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="26-35" id="age2" />
                <Label htmlFor="age2">26-35</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="36-45" id="age3" />
                <Label htmlFor="age3">36-45</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="46+" id="age4" />
                <Label htmlFor="age4">46+</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <RadioGroup value={profile.gender} onValueChange={(value) => updateProfile('gender', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">Female</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="non-binary" id="non-binary" />
                <Label htmlFor="non-binary">Non-binary</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Other</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )
    },
    {
      title: "Level 1: What's Most Painful Right Now?",
      content: (
        <div className="space-y-4">
          <div>
            <Label>What area of your life feels the most painful right now?</Label>
            <RadioGroup value={profile.primaryPainPoint} onValueChange={(value) => updateProfile('primaryPainPoint', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="self-worth" id="self-worth" />
                <Label htmlFor="self-worth">Self-worth</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="relationships" id="relationships" />
                <Label htmlFor="relationships">Relationships</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="family" id="family" />
                <Label htmlFor="family">Family</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="identity" id="identity" />
                <Label htmlFor="identity">Identity</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="work-school" id="work-school" />
                <Label htmlFor="work-school">Work/school</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="loneliness" id="loneliness" />
                <Label htmlFor="loneliness">Loneliness</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>What do you feel is missing from your life emotionally?</Label>
            <Select value={profile.emotionallyMissing} onValueChange={(value) => updateProfile('emotionallyMissing', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select what's missing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="understanding">Understanding</SelectItem>
                <SelectItem value="acceptance">Acceptance</SelectItem>
                <SelectItem value="love">Love</SelectItem>
                <SelectItem value="safety">Safety</SelectItem>
                <SelectItem value="purpose">Purpose</SelectItem>
                <SelectItem value="connection">Connection</SelectItem>
                <SelectItem value="peace">Peace</SelectItem>
                <SelectItem value="confidence">Confidence</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Do you ever feel "stuck" in the same emotional patterns?</Label>
            <RadioGroup value={profile.stuckPatterns} onValueChange={(value) => updateProfile('stuckPatterns', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes-often" id="stuck-often" />
                <Label htmlFor="stuck-often">Yes, often</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes-sometimes" id="stuck-sometimes" />
                <Label htmlFor="stuck-sometimes">Yes, sometimes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rarely" id="stuck-rarely" />
                <Label htmlFor="stuck-rarely">Rarely</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="stuck-no" />
                <Label htmlFor="stuck-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Do you often feel overwhelmed, even by small things?</Label>
            <RadioGroup value={profile.overwhelmedEasily} onValueChange={(value) => updateProfile('overwhelmedEasily', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes-very-often" id="overwhelmed-very" />
                <Label htmlFor="overwhelmed-very">Yes, very often</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes-sometimes" id="overwhelmed-sometimes" />
                <Label htmlFor="overwhelmed-sometimes">Yes, sometimes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rarely" id="overwhelmed-rarely" />
                <Label htmlFor="overwhelmed-rarely">Rarely</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="overwhelmed-no" />
                <Label htmlFor="overwhelmed-no">No</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowChat(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (showChat) {
    return <ChatInterface onClose={onClose} userProfile={profile} />;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="wellness-gradient text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-6 w-6" />
              {steps[currentStep].title}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="text-sm opacity-90">
            Step {currentStep + 1} of {steps.length}
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[60vh]">
          {steps[currentStep].content}
        </CardContent>

        <div className="p-6 border-t bg-gray-50 flex justify-between">
          <Button 
            variant="outline" 
            onClick={prevStep} 
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <Button 
            onClick={nextStep}
            disabled={showWarning && !canProceed}
            className="bg-wellness-purple hover:bg-wellness-purple/90 flex items-center gap-2"
          >
            {currentStep === steps.length - 1 ? 'Start Talking' : 'Continue'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default OnboardingFlow;
