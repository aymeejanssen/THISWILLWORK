
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  hasDiagnosedCondition: string;
  
  // Identity & Emotional State
  emotionalState: string;
  mostDifficultPart: string;
  overwhelmedResponse: string;
  feelNotYourself: string;
  feelAlone: string;
  
  // Self-Worth & Inner Dialogue
  selfTreatment: string;
  confidenceStruggles: string;
  safeExpressing: string;
  complimentsUncomfortable: string;
  guiltyBoundaries: string;
  
  // Family & Upbringing
  parentRelationship: string;
  emotionalSupport: string;
  physicalEmotionalHurt: string;
  feelingsValidated: string;
  homeInstability: string;
  
  // Childhood & School
  bullyingRejection: string;
  encouragedEmotions: string;
  safetAtSchool: string;
  feelDifferent: string;
  madeAshamed: string;
  
  // Loss, Trauma, and Safety
  significantLoss: string;
  traumaticEvent: string;
  feelSafeToday: string;
  triggeredMemories: string;
  avoidPainful: string;
  
  // Patterns & Current Impact
  repeatingPatterns: string;
  pastInfluencing: string;
  trustFear: string;
  pushAwayOvercompensate: string;
  emotionalBurden: string;
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
    hasDiagnosedCondition: '',
    
    // Identity & Emotional State
    emotionalState: '',
    mostDifficultPart: '',
    overwhelmedResponse: '',
    feelNotYourself: '',
    feelAlone: '',
    
    // Self-Worth & Inner Dialogue
    selfTreatment: '',
    confidenceStruggles: '',
    safeExpressing: '',
    complimentsUncomfortable: '',
    guiltyBoundaries: '',
    
    // Family & Upbringing
    parentRelationship: '',
    emotionalSupport: '',
    physicalEmotionalHurt: '',
    feelingsValidated: '',
    homeInstability: '',
    
    // Childhood & School
    bullyingRejection: '',
    encouragedEmotions: '',
    safetAtSchool: '',
    feelDifferent: '',
    madeAshamed: '',
    
    // Loss, Trauma, and Safety
    significantLoss: '',
    traumaticEvent: '',
    feelSafeToday: '',
    triggeredMemories: '',
    avoidPainful: '',
    
    // Patterns & Current Impact
    repeatingPatterns: '',
    pastInfluencing: '',
    trustFear: '',
    pushAwayOvercompensate: '',
    emotionalBurden: ''
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
            Before we begin, we need to ask you one important question.
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
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
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
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Other</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )
    },
    {
      title: "Identity & Emotional State",
      content: (
        <div className="space-y-4">
          <div>
            <Label>How would you describe your emotional state lately?</Label>
            <RadioGroup value={profile.emotionalState} onValueChange={(value) => updateProfile('emotionalState', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="stable" id="stable" />
                <Label htmlFor="stable">Generally stable</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="up-and-down" id="up-and-down" />
                <Label htmlFor="up-and-down">Up and down</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="overwhelmed" id="overwhelmed" />
                <Label htmlFor="overwhelmed">Often overwhelmed</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="numb" id="numb" />
                <Label htmlFor="numb">Feeling numb or disconnected</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="struggling" id="struggling" />
                <Label htmlFor="struggling">Really struggling</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label>What part of your life feels the most difficult right now?</Label>
            <RadioGroup value={profile.mostDifficultPart} onValueChange={(value) => updateProfile('mostDifficultPart', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="relationships" id="relationships" />
                <Label htmlFor="relationships">Relationships</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="work-school" id="work-school" />
                <Label htmlFor="work-school">Work/School</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="family" id="family" />
                <Label htmlFor="family">Family</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="self-worth" id="self-worth" />
                <Label htmlFor="self-worth">Self-worth</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="loneliness" id="loneliness" />
                <Label htmlFor="loneliness">Loneliness</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>How do you usually respond when you're feeling overwhelmed?</Label>
            <RadioGroup value={profile.overwhelmedResponse} onValueChange={(value) => updateProfile('overwhelmedResponse', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="withdraw" id="withdraw" />
                <Label htmlFor="withdraw">Withdraw or isolate</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="seek-help" id="seek-help" />
                <Label htmlFor="seek-help">Seek help from others</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="stay-busy" id="stay-busy" />
                <Label htmlFor="stay-busy">Stay busy or distract myself</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="shut-down" id="shut-down" />
                <Label htmlFor="shut-down">Emotionally shut down</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lash-out" id="lash-out" />
                <Label htmlFor="lash-out">Get angry or lash out</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Do you ever feel like you're not yourself lately?</Label>
            <RadioGroup value={profile.feelNotYourself} onValueChange={(value) => updateProfile('feelNotYourself', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="often" id="not-yourself-often" />
                <Label htmlFor="not-yourself-often">Yes, often</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sometimes" id="not-yourself-sometimes" />
                <Label htmlFor="not-yourself-sometimes">Sometimes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rarely" id="not-yourself-rarely" />
                <Label htmlFor="not-yourself-rarely">Rarely</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="not-yourself-no" />
                <Label htmlFor="not-yourself-no">No, I feel like myself</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Do you often feel alone, even when you're around others?</Label>
            <RadioGroup value={profile.feelAlone} onValueChange={(value) => updateProfile('feelAlone', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="very-often" id="alone-very-often" />
                <Label htmlFor="alone-very-often">Yes, very often</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sometimes" id="alone-sometimes" />
                <Label htmlFor="alone-sometimes">Sometimes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rarely" id="alone-rarely" />
                <Label htmlFor="alone-rarely">Rarely</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="alone-no" />
                <Label htmlFor="alone-no">No, I feel connected</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )
    },
    {
      title: "Self-Worth & Inner Dialogue",
      content: (
        <div className="space-y-4">
          <div>
            <Label>Are you generally kind or critical to yourself?</Label>
            <RadioGroup value={profile.selfTreatment} onValueChange={(value) => updateProfile('selfTreatment', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="very-kind" id="very-kind" />
                <Label htmlFor="very-kind">Very kind and compassionate</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mostly-kind" id="mostly-kind" />
                <Label htmlFor="mostly-kind">Mostly kind</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mixed" id="mixed" />
                <Label htmlFor="mixed">Mixed - depends on the situation</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mostly-critical" id="mostly-critical" />
                <Label htmlFor="mostly-critical">Mostly critical</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="very-critical" id="very-critical" />
                <Label htmlFor="very-critical">Very critical and harsh</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Do you struggle with confidence or feeling "enough"?</Label>
            <RadioGroup value={profile.confidenceStruggles} onValueChange={(value) => updateProfile('confidenceStruggles', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="constantly" id="confidence-constantly" />
                <Label htmlFor="confidence-constantly">Yes, constantly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="often" id="confidence-often" />
                <Label htmlFor="confidence-often">Yes, often</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sometimes" id="confidence-sometimes" />
                <Label htmlFor="confidence-sometimes">Sometimes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rarely" id="confidence-rarely" />
                <Label htmlFor="confidence-rarely">Rarely</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="confidence-no" />
                <Label htmlFor="confidence-no">No, I feel confident</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Do you feel safe expressing your true feelings to others?</Label>
            <RadioGroup value={profile.safeExpressing} onValueChange={(value) => updateProfile('safeExpressing', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="very-safe" id="expressing-safe" />
                <Label htmlFor="expressing-safe">Yes, very safe</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mostly-safe" id="expressing-mostly" />
                <Label htmlFor="expressing-mostly">Mostly safe</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="depends" id="expressing-depends" />
                <Label htmlFor="expressing-depends">Depends on the person</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="usually-not" id="expressing-not" />
                <Label htmlFor="expressing-not">Usually not safe</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="never" id="expressing-never" />
                <Label htmlFor="expressing-never">Never feel safe</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Do compliments or praise make you feel uncomfortable?</Label>
            <RadioGroup value={profile.complimentsUncomfortable} onValueChange={(value) => updateProfile('complimentsUncomfortable', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="very-uncomfortable" id="compliments-very" />
                <Label htmlFor="compliments-very">Yes, very uncomfortable</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="somewhat" id="compliments-somewhat" />
                <Label htmlFor="compliments-somewhat">Somewhat uncomfortable</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="neutral" id="compliments-neutral" />
                <Label htmlFor="compliments-neutral">Neutral</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="appreciate" id="compliments-appreciate" />
                <Label htmlFor="compliments-appreciate">I appreciate them</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="love-them" id="compliments-love" />
                <Label htmlFor="compliments-love">I love receiving them</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Do you often feel guilty when setting boundaries or saying no?</Label>
            <RadioGroup value={profile.guiltyBoundaries} onValueChange={(value) => updateProfile('guiltyBoundaries', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="always" id="boundaries-always" />
                <Label htmlFor="boundaries-always">Yes, almost always</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="often" id="boundaries-often" />
                <Label htmlFor="boundaries-often">Yes, often</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sometimes" id="boundaries-sometimes" />
                <Label htmlFor="boundaries-sometimes">Sometimes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rarely" id="boundaries-rarely" />
                <Label htmlFor="boundaries-rarely">Rarely</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="never" id="boundaries-never" />
                <Label htmlFor="boundaries-never">No, never</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )
    },
    {
      title: "Family & Upbringing",
      content: (
        <div className="space-y-4">
          <div>
            <Label>How would you describe your relationship with your parents growing up?</Label>
            <RadioGroup value={profile.parentRelationship} onValueChange={(value) => updateProfile('parentRelationship', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="very-close" id="parents-close" />
                <Label htmlFor="parents-close">Very close and supportive</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mostly-good" id="parents-good" />
                <Label htmlFor="parents-good">Mostly good</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="complicated" id="parents-complicated" />
                <Label htmlFor="parents-complicated">Complicated</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="distant" id="parents-distant" />
                <Label htmlFor="parents-distant">Distant or cold</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="difficult" id="parents-difficult" />
                <Label htmlFor="parents-difficult">Very difficult or harmful</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Did you feel emotionally supported and understood as a child?</Label>
            <RadioGroup value={profile.emotionalSupport} onValueChange={(value) => updateProfile('emotionalSupport', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="always" id="support-always" />
                <Label htmlFor="support-always">Yes, always</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mostly" id="support-mostly" />
                <Label htmlFor="support-mostly">Mostly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sometimes" id="support-sometimes" />
                <Label htmlFor="support-sometimes">Sometimes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rarely" id="support-rarely" />
                <Label htmlFor="support-rarely">Rarely</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="never" id="support-never" />
                <Label htmlFor="support-never">No, never</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Were you ever physically or emotionally hurt by a family member?</Label>
            <RadioGroup value={profile.physicalEmotionalHurt} onValueChange={(value) => updateProfile('physicalEmotionalHurt', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="hurt-no" />
                <Label htmlFor="hurt-no">No</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="emotional-sometimes" id="hurt-emotional" />
                <Label htmlFor="hurt-emotional">Emotionally, sometimes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="emotional-often" id="hurt-emotional-often" />
                <Label htmlFor="hurt-emotional-often">Emotionally, often</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="physical-sometimes" id="hurt-physical" />
                <Label htmlFor="hurt-physical">Physically, sometimes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="hurt-both" />
                <Label htmlFor="hurt-both">Both physically and emotionally</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Were your feelings validated in your home, or dismissed?</Label>
            <RadioGroup value={profile.feelingsValidated} onValueChange={(value) => updateProfile('feelingsValidated', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="always-validated" id="validated-always" />
                <Label htmlFor="validated-always">Always validated</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mostly-validated" id="validated-mostly" />
                <Label htmlFor="validated-mostly">Mostly validated</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mixed" id="validated-mixed" />
                <Label htmlFor="validated-mixed">Mixed</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mostly-dismissed" id="validated-dismissed" />
                <Label htmlFor="validated-dismissed">Mostly dismissed</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="always-dismissed" id="validated-never" />
                <Label htmlFor="validated-never">Always dismissed</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Was there any instability in your home (divorce, addiction, mental illness)?</Label>
            <RadioGroup value={profile.homeInstability} onValueChange={(value) => updateProfile('homeInstability', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="instability-no" />
                <Label htmlFor="instability-no">No, it was stable</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="divorce" id="instability-divorce" />
                <Label htmlFor="instability-divorce">Divorce/separation</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="addiction" id="instability-addiction" />
                <Label htmlFor="instability-addiction">Addiction issues</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mental-illness" id="instability-mental" />
                <Label htmlFor="instability-mental">Mental illness</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="multiple" id="instability-multiple" />
                <Label htmlFor="instability-multiple">Multiple issues</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )
    },
    {
      title: "Childhood & School",
      content: (
        <div className="space-y-4">
          <div>
            <Label>Did you experience bullying, rejection, or exclusion growing up?</Label>
            <RadioGroup value={profile.bullyingRejection} onValueChange={(value) => updateProfile('bullyingRejection', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="bullying-no" />
                <Label htmlFor="bullying-no">No, I felt accepted</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mild" id="bullying-mild" />
                <Label htmlFor="bullying-mild">Some mild teasing</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="moderate" id="bullying-moderate" />
                <Label htmlFor="bullying-moderate">Moderate bullying</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="severe" id="bullying-severe" />
                <Label htmlFor="bullying-severe">Severe bullying</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excluded" id="bullying-excluded" />
                <Label htmlFor="bullying-excluded">Felt excluded/rejected</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Were you encouraged to express your emotions as a child?</Label>
            <RadioGroup value={profile.encouragedEmotions} onValueChange={(value) => updateProfile('encouragedEmotions', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="always" id="emotions-always" />
                <Label htmlFor="emotions-always">Yes, always</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mostly" id="emotions-mostly" />
                <Label htmlFor="emotions-mostly">Mostly yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mixed" id="emotions-mixed" />
                <Label htmlFor="emotions-mixed">Mixed messages</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="discouraged" id="emotions-discouraged" />
                <Label htmlFor="emotions-discouraged">Usually discouraged</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="never" id="emotions-never" />
                <Label htmlFor="emotions-never">Never encouraged</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Did you feel safe and accepted at school?</Label>
            <RadioGroup value={profile.safetAtSchool} onValueChange={(value) => updateProfile('safetAtSchool', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="very-safe" id="school-safe" />
                <Label htmlFor="school-safe">Yes, very safe</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mostly-safe" id="school-mostly" />
                <Label htmlFor="school-mostly">Mostly safe</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="neutral" id="school-neutral" />
                <Label htmlFor="school-neutral">Neutral</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="often-unsafe" id="school-unsafe" />
                <Label htmlFor="school-unsafe">Often felt unsafe</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="never-safe" id="school-never" />
                <Label htmlFor="school-never">Never felt safe</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Did you ever feel different or like you didn't belong?</Label>
            <RadioGroup value={profile.feelDifferent} onValueChange={(value) => updateProfile('feelDifferent', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="different-no" />
                <Label htmlFor="different-no">No, I felt like I belonged</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sometimes" id="different-sometimes" />
                <Label htmlFor="different-sometimes">Sometimes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="often" id="different-often" />
                <Label htmlFor="different-often">Often</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="always" id="different-always" />
                <Label htmlFor="different-always">Almost always</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="deeply" id="different-deeply" />
                <Label htmlFor="different-deeply">Very deeply different</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Were you ever made to feel ashamed of who you are?</Label>
            <RadioGroup value={profile.madeAshamed} onValueChange={(value) => updateProfile('madeAshamed', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="ashamed-no" />
                <Label htmlFor="ashamed-no">No, never</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rarely" id="ashamed-rarely" />
                <Label htmlFor="ashamed-rarely">Rarely</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sometimes" id="ashamed-sometimes" />
                <Label htmlFor="ashamed-sometimes">Sometimes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="often" id="ashamed-often" />
                <Label htmlFor="ashamed-often">Often</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="constantly" id="ashamed-constantly" />
                <Label htmlFor="ashamed-constantly">Constantly</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )
    },
    {
      title: "Loss, Trauma, and Safety",
      content: (
        <div className="space-y-4">
          <div>
            <Label>Have you experienced a significant loss, such as death or separation?</Label>
            <RadioGroup value={profile.significantLoss} onValueChange={(value) => updateProfile('significantLoss', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="loss-no" />
                <Label htmlFor="loss-no">No</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="minor" id="loss-minor" />
                <Label htmlFor="loss-minor">Minor losses</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="significant" id="loss-significant" />
                <Label htmlFor="loss-significant">One significant loss</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="multiple" id="loss-multiple" />
                <Label htmlFor="loss-multiple">Multiple significant losses</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="traumatic" id="loss-traumatic" />
                <Label htmlFor="loss-traumatic">Traumatic loss</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Have you lived through a traumatic event that still affects you today?</Label>
            <RadioGroup value={profile.traumaticEvent} onValueChange={(value) => updateProfile('traumaticEvent', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="trauma-no" />
                <Label htmlFor="trauma-no">No</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="maybe" id="trauma-maybe" />
                <Label htmlFor="trauma-maybe">Maybe/I'm not sure</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes-mild" id="trauma-mild" />
                <Label htmlFor="trauma-mild">Yes, but mild impact</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes-moderate" id="trauma-moderate" />
                <Label htmlFor="trauma-moderate">Yes, moderate impact</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes-severe" id="trauma-severe" />
                <Label htmlFor="trauma-severe">Yes, severe impact</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Do you feel safe in your relationships and environments today?</Label>
            <RadioGroup value={profile.feelSafeToday} onValueChange={(value) => updateProfile('feelSafeToday', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="very-safe" id="safe-very" />
                <Label htmlFor="safe-very">Yes, very safe</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mostly-safe" id="safe-mostly" />
                <Label htmlFor="safe-mostly">Mostly safe</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sometimes" id="safe-sometimes" />
                <Label htmlFor="safe-sometimes">Sometimes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="often-unsafe" id="safe-often-unsafe" />
                <Label htmlFor="safe-often-unsafe">Often feel unsafe</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="never-safe" id="safe-never" />
                <Label htmlFor="safe-never">Rarely feel safe</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Do certain memories, people, or places trigger emotional discomfort?</Label>
            <RadioGroup value={profile.triggeredMemories} onValueChange={(value) => updateProfile('triggeredMemories', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="triggered-no" />
                <Label htmlFor="triggered-no">No, not really</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="occasionally" id="triggered-occasionally" />
                <Label htmlFor="triggered-occasionally">Occasionally</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sometimes" id="triggered-sometimes" />
                <Label htmlFor="triggered-sometimes">Sometimes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="often" id="triggered-often" />
                <Label htmlFor="triggered-often">Often</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="very-often" id="triggered-very-often" />
                <Label htmlFor="triggered-very-often">Very often</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Do you avoid certain topics or feelings because they're too painful?</Label>
            <RadioGroup value={profile.avoidPainful} onValueChange={(value) => updateProfile('avoidPainful', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="avoid-no" />
                <Label htmlFor="avoid-no">No, I face them</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sometimes" id="avoid-sometimes" />
                <Label htmlFor="avoid-sometimes">Sometimes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="often" id="avoid-often" />
                <Label htmlFor="avoid-often">Often</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="usually" id="avoid-usually" />
                <Label htmlFor="avoid-usually">Usually</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="always" id="avoid-always" />
                <Label htmlFor="avoid-always">Always</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )
    },
    {
      title: "Patterns & Current Impact",
      content: (
        <div className="space-y-4">
          <div>
            <Label>Do you find yourself repeating painful patterns in relationships or work?</Label>
            <RadioGroup value={profile.repeatingPatterns} onValueChange={(value) => updateProfile('repeatingPatterns', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="patterns-no" />
                <Label htmlFor="patterns-no">No, I learn and grow</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sometimes" id="patterns-sometimes" />
                <Label htmlFor="patterns-sometimes">Sometimes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="often" id="patterns-often" />
                <Label htmlFor="patterns-often">Often</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="always" id="patterns-always" />
                <Label htmlFor="patterns-always">Yes, almost always</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="stuck" id="patterns-stuck" />
                <Label htmlFor="patterns-stuck">I feel completely stuck</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Do you feel like your past is still influencing your present?</Label>
            <RadioGroup value={profile.pastInfluencing} onValueChange={(value) => updateProfile('pastInfluencing', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="past-no" />
                <Label htmlFor="past-no">No, I've moved on</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="a-little" id="past-little" />
                <Label htmlFor="past-little">A little bit</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="moderately" id="past-moderately" />
                <Label htmlFor="past-moderately">Moderately</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="significantly" id="past-significantly" />
                <Label htmlFor="past-significantly">Significantly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="completely" id="past-completely" />
                <Label htmlFor="past-completely">It controls my present</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Do you struggle to trust others, or fear abandonment?</Label>
            <RadioGroup value={profile.trustFear} onValueChange={(value) => updateProfile('trustFear', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="trust-no" />
                <Label htmlFor="trust-no">No, I trust easily</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sometimes" id="trust-sometimes" />
                <Label htmlFor="trust-sometimes">Sometimes struggle</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="often" id="trust-often" />
                <Label htmlFor="trust-often">Often struggle</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="major-trust" id="trust-major" />
                <Label htmlFor="trust-major">Major trust issues</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fear-abandonment" id="trust-abandonment" />
                <Label htmlFor="trust-abandonment">Deep fear of abandonment</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Do you often push people away or overcompensate to feel accepted?</Label>
            <RadioGroup value={profile.pushAwayOvercompensate} onValueChange={(value) => updateProfile('pushAwayOvercompensate', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="neither" id="push-neither" />
                <Label htmlFor="push-neither">Neither, I'm balanced</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="push-away" id="push-away" />
                <Label htmlFor="push-away">I often push people away</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="overcompensate" id="push-overcompensate" />
                <Label htmlFor="push-overcompensate">I overcompensate/people-please</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="push-both" />
                <Label htmlFor="push-both">I do both at different times</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="extreme" id="push-extreme" />
                <Label htmlFor="push-extreme">I swing between extremes</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>What's one emotional burden you wish you could let go of?</Label>
            <RadioGroup value={profile.emotionalBurden} onValueChange={(value) => updateProfile('emotionalBurden', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="guilt-shame" id="burden-guilt" />
                <Label htmlFor="burden-guilt">Guilt and shame</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fear-anxiety" id="burden-fear" />
                <Label htmlFor="burden-fear">Fear and anxiety</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="anger-resentment" id="burden-anger" />
                <Label htmlFor="burden-anger">Anger and resentment</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sadness-grief" id="burden-sadness" />
                <Label htmlFor="burden-sadness">Sadness and grief</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="feeling-not-enough" id="burden-not-enough" />
                <Label htmlFor="burden-not-enough">Feeling "not enough"</Label>
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
