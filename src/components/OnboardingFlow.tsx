
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
  relationshipStatus: string;
  hasDiagnosedCondition: string;
  diagnosedConditions: string;
  traumaHistory: string;
  childhoodChallenges: string;
  currentStruggles: string[];
  supportGoals: string;
  previousTherapy: string;
  spiritualBeliefs: string;
  familyDynamics: string;
  workSituation: string;
  stressLevel: string;
  copingMechanisms: string;
}

const OnboardingFlow = ({ onClose }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [canProceed, setCanProceed] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    age: '',
    gender: '',
    culture: '',
    preferredLanguage: '',
    location: '',
    relationshipStatus: '',
    hasDiagnosedCondition: '',
    diagnosedConditions: '',
    traumaHistory: '',
    childhoodChallenges: '',
    currentStruggles: [],
    supportGoals: '',
    previousTherapy: '',
    spiritualBeliefs: '',
    familyDynamics: '',
    workSituation: '',
    stressLevel: '',
    copingMechanisms: ''
  });

  const updateProfile = (field: keyof UserProfile, value: string | string[]) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    
    if (field === 'hasDiagnosedCondition' && value === 'yes') {
      setShowWarning(true);
      setCanProceed(false);
    } else if (field === 'hasDiagnosedCondition' && value === 'no') {
      setShowWarning(false);
      setCanProceed(true);
    }
  };

  const handleStruggleToggle = (struggle: string) => {
    const current = profile.currentStruggles;
    const updated = current.includes(struggle)
      ? current.filter(s => s !== struggle)
      : [...current, struggle];
    updateProfile('currentStruggles', updated);
  };

  const steps = [
    {
      title: "Welcome to Your Healing Journey",
      content: (
        <div className="space-y-6 text-center">
          <div className="text-6xl mb-4">🌱</div>
          <p className="text-lg text-gray-600 leading-relaxed">
            We're honored you've chosen to begin this journey with us. To provide you with the most personalized 
            and culturally sensitive support, we'd like to understand you better.
          </p>
          <p className="text-sm text-gray-500">
            All information is completely private and encrypted. You can skip any question that feels uncomfortable.
          </p>
        </div>
      )
    },
    {
      title: "Let's Start with the Basics",
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">What would you like us to call you?</Label>
            <Input
              id="name"
              placeholder="Your name or nickname"
              value={profile.name}
              onChange={(e) => updateProfile('name', e.target.value)}
            />
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
            <Label htmlFor="gender">How do you identify?</Label>
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
                <RadioGroupItem value="prefer-not-to-say" id="prefer-not" />
                <Label htmlFor="prefer-not">Prefer not to say</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )
    },
    {
      title: "Your Cultural Background",
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="culture">What's your cultural or ethnic background?</Label>
            <Input
              id="culture"
              placeholder="e.g., Arab, South Asian, Latino, etc."
              value={profile.culture}
              onChange={(e) => updateProfile('culture', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="language">What language do you feel most comfortable expressing emotions in?</Label>
            <Input
              id="language"
              placeholder="e.g., English, Arabic, Spanish, Hindi, etc."
              value={profile.preferredLanguage}
              onChange={(e) => updateProfile('preferredLanguage', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="location">Where are you currently located?</Label>
            <Input
              id="location"
              placeholder="Country or region"
              value={profile.location}
              onChange={(e) => updateProfile('location', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="spiritual">Do you have any spiritual or religious beliefs that are important to you?</Label>
            <Textarea
              id="spiritual"
              placeholder="Optional - this helps us respect your values"
              value={profile.spiritualBeliefs}
              onChange={(e) => updateProfile('spiritualBeliefs', e.target.value)}
            />
          </div>
        </div>
      )
    },
    {
      title: "Important Health & Safety Question",
      content: (
        <div className="space-y-6">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800 mb-2">
                  Do you currently have any diagnosed mental health conditions?
                </p>
                <p className="text-sm text-yellow-700">
                  (Examples: Clinical depression, anxiety disorders, PTSD, bipolar disorder, eating disorders, etc.)
                </p>
              </div>
            </div>
          </div>
          
          <RadioGroup value={profile.hasDiagnosedCondition} onValueChange={(value) => updateProfile('hasDiagnosedCondition', value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="diagnosed-yes" />
              <Label htmlFor="diagnosed-yes">Yes, I have diagnosed condition(s)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="diagnosed-no" />
              <Label htmlFor="diagnosed-no">No, I don't have any diagnosed conditions</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unsure" id="diagnosed-unsure" />
              <Label htmlFor="diagnosed-unsure">I'm not sure</Label>
            </div>
          </RadioGroup>

          {profile.hasDiagnosedCondition === 'yes' && (
            <div>
              <Label htmlFor="conditions">Please specify your diagnosed condition(s):</Label>
              <Textarea
                id="conditions"
                placeholder="List your diagnosed conditions"
                value={profile.diagnosedConditions}
                onChange={(e) => updateProfile('diagnosedConditions', e.target.value)}
              />
            </div>
          )}

          {showWarning && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-800 mb-2">Important Notice</p>
                  <p className="text-red-700 mb-3">
                    MindEase is not designed to treat diagnosed mental health conditions. We strongly recommend 
                    working with a licensed mental health professional for your primary care.
                  </p>
                  <p className="text-red-700 mb-3">
                    However, we can still be here as a supportive companion alongside your professional treatment. 
                    Think of us as an encouraging friend who's available 24/7.
                  </p>
                  <Button 
                    size="sm" 
                    onClick={() => setCanProceed(true)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    I understand - Continue as supportive companion
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      title: "Your Life Context",
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="relationship">Relationship status</Label>
            <RadioGroup value={profile.relationshipStatus} onValueChange={(value) => updateProfile('relationshipStatus', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single" id="single" />
                <Label htmlFor="single">Single</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dating" id="dating" />
                <Label htmlFor="dating">Dating/In a relationship</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="married" id="married" />
                <Label htmlFor="married">Married/Partnered</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="complicated" id="complicated" />
                <Label htmlFor="complicated">It's complicated</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label htmlFor="work">Current work/study situation</Label>
            <Input
              id="work"
              placeholder="e.g., Student, Working full-time, Unemployed, etc."
              value={profile.workSituation}
              onChange={(e) => updateProfile('workSituation', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="family">How would you describe your family dynamics?</Label>
            <Textarea
              id="family"
              placeholder="Optional - e.g., supportive, complicated, distant, traditional, etc."
              value={profile.familyDynamics}
              onChange={(e) => updateProfile('familyDynamics', e.target.value)}
            />
          </div>
        </div>
      )
    },
    {
      title: "What You're Going Through",
      content: (
        <div className="space-y-4">
          <div>
            <Label>What are you currently struggling with? (Select all that apply)</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                'Self-confidence', 'Relationship issues', 'Work burnout', 'Family pressure',
                'Loneliness', 'Anxiety', 'Identity questions', 'Life transitions',
                'Stress management', 'Goal setting', 'Cultural adaptation', 'Heartbreak'
              ].map((struggle) => (
                <Badge
                  key={struggle}
                  variant={profile.currentStruggles.includes(struggle) ? "default" : "outline"}
                  className={`cursor-pointer text-center p-2 ${
                    profile.currentStruggles.includes(struggle) 
                      ? 'bg-wellness-purple text-white' 
                      : 'hover:bg-wellness-purple/10'
                  }`}
                  onClick={() => handleStruggleToggle(struggle)}
                >
                  {struggle}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="stress">On a scale of 1-10, how would you rate your current stress level?</Label>
            <RadioGroup value={profile.stressLevel} onValueChange={(value) => updateProfile('stressLevel', value)}>
              <div className="flex space-x-4">
                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                  <div key={num} className="flex items-center space-x-1">
                    <RadioGroupItem value={num.toString()} id={`stress-${num}`} />
                    <Label htmlFor={`stress-${num}`}>{num}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        </div>
      )
    },
    {
      title: "Your Support Goals",
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="goals">What are you hoping to get from talking with our AI companion?</Label>
            <Textarea
              id="goals"
              placeholder="e.g., Someone to listen, help processing emotions, daily motivation, etc."
              value={profile.supportGoals}
              onChange={(e) => updateProfile('supportGoals', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="therapy">Have you tried therapy or counseling before?</Label>
            <RadioGroup value={profile.previousTherapy} onValueChange={(value) => updateProfile('previousTherapy', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes-helpful" id="therapy-yes" />
                <Label htmlFor="therapy-yes">Yes, and it was helpful</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes-not-helpful" id="therapy-no-help" />
                <Label htmlFor="therapy-no-help">Yes, but it wasn't helpful</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no-want-to" id="therapy-want" />
                <Label htmlFor="therapy-want">No, but I'd like to try</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no-not-interested" id="therapy-not-interested" />
                <Label htmlFor="therapy-not-interested">No, and I'm not interested</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label htmlFor="coping">What helps you feel better when you're stressed? (Optional)</Label>
            <Textarea
              id="coping"
              placeholder="e.g., music, exercise, talking to friends, prayer, etc."
              value={profile.copingMechanisms}
              onChange={(e) => updateProfile('copingMechanisms', e.target.value)}
            />
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Onboarding complete
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
