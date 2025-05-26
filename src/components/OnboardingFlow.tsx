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
            We need to ask you one important question.
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
    },
    {
      title: "Level 2: Family & Upbringing",
      content: (
        <div className="space-y-4">
          <div>
            <Label>How would you describe your relationship with your parents growing up?</Label>
            <RadioGroup value={profile.parentRelationship} onValueChange={(value) => updateProfile('parentRelationship', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="supportive" id="parent-supportive" />
                <Label htmlFor="parent-supportive">Supportive</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="distant" id="parent-distant" />
                <Label htmlFor="parent-distant">Distant</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="conflicted" id="parent-conflicted" />
                <Label htmlFor="parent-conflicted">Conflicted</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Was your home environment emotionally safe?</Label>
            <RadioGroup value={profile.homeEnvironment} onValueChange={(value) => updateProfile('homeEnvironment', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="home-safe-yes" />
                <Label htmlFor="home-safe-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="home-safe-no" />
                <Label htmlFor="home-safe-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Were your parents emotionally available or distant?</Label>
            <RadioGroup value={profile.parentAvailability} onValueChange={(value) => updateProfile('parentAvailability', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="available" id="parent-available" />
                <Label htmlFor="parent-available">Available</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="distant" id="parent-distant" />
                <Label htmlFor="parent-distant">Distant</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Did you feel seen, heard, and accepted at home?</Label>
            <RadioGroup value={profile.feltSeenHeard} onValueChange={(value) => updateProfile('feltSeenHeard', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="seen-heard-yes" />
                <Label htmlFor="seen-heard-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="seen-heard-no" />
                <Label htmlFor="seen-heard-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Did your parents often argue or fight in front of you?</Label>
            <RadioGroup value={profile.parentFighting} onValueChange={(value) => updateProfile('parentFighting', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="parents-fight-yes" />
                <Label htmlFor="parents-fight-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="parents-fight-no" />
                <Label htmlFor="parents-fight-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Did you experience divorce, separation, or abandonment?</Label>
            <RadioGroup value={profile.divorceAbandonment} onValueChange={(value) => updateProfile('divorceAbandonment', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="divorce-yes" />
                <Label htmlFor="divorce-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="divorce-no" />
                <Label htmlFor="divorce-no">No</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )
    },
    {
      title: "Level 3: Specific Childhood Adversities",
      content: (
        <div className="space-y-4">
          <div>
            <Label>Were you ever physically punished or hit by a parent or adult?</Label>
            <RadioGroup value={profile.physicalPunishment} onValueChange={(value) => updateProfile('physicalPunishment', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="punished-yes" />
                <Label htmlFor="punished-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="punished-no" />
                <Label htmlFor="punished-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Were you ever yelled at, insulted, or made to feel small as a child?</Label>
            <RadioGroup value={profile.verbalAbuse} onValueChange={(value) => updateProfile('verbalAbuse', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="verbal-yes" />
                <Label htmlFor="verbal-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="verbal-no" />
                <Label htmlFor="verbal-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Did anyone in your home struggle with addiction, anger, or mental illness?</Label>
            <RadioGroup value={profile.homeAddictionMentalIllness} onValueChange={(value) => updateProfile('homeAddictionMentalIllness', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="addiction-yes" />
                <Label htmlFor="addiction-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="addiction-no" />
                <Label htmlFor="addiction-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Did you ever fear for your safety at home?</Label>
            <RadioGroup value={profile.fearedSafety} onValueChange={(value) => updateProfile('fearedSafety', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="safety-yes" />
                <Label htmlFor="safety-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="safety-no" />
                <Label htmlFor="safety-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Were you made to feel like you were "never good enough"?</Label>
            <RadioGroup value={profile.neverGoodEnough} onValueChange={(value) => updateProfile('neverGoodEnough', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="good-enough-yes" />
                <Label htmlFor="good-enough-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="good-enough-no" />
                <Label htmlFor="good-enough-no">No</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )
    },
    {
      title: "Level 4: Peer & Social Trauma",
      content: (
        <div className="space-y-4">
          <div>
            <Label>Were you ever bullied or excluded at school?</Label>
            <RadioGroup value={profile.bulliedExcluded} onValueChange={(value) => updateProfile('bulliedExcluded', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="bullied-yes" />
                <Label htmlFor="bullied-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="bullied-no" />
                <Label htmlFor="bullied-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Were you pressured to hide who you really were around others?</Label>
            <RadioGroup value={profile pressuredToHide} onValueChange={(value) => updateProfile('pressuredToHide', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="hide-yes" />
                <Label htmlFor="hide-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="hide-no" />
                <Label htmlFor="hide-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Did you ever feel ashamed about your identity, appearance, or interests?</Label>
            <RadioGroup value={profile.identityShame} onValueChange={(value) => updateProfile('identityShame', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="shame-yes" />
                <Label htmlFor="shame-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="shame-no" />
                <Label htmlFor="shame-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Were you ever humiliated in public (at school, at home)?</Label>
            <RadioGroup value={profile.publicHumiliation} onValueChange={(value) => updateProfile('publicHumiliation', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="humiliation-yes" />
                <Label htmlFor="humiliation-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="humiliation-no" />
                <Label htmlFor="humiliation-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Did you ever feel completely alone, even with others around?</Label>
            <RadioGroup value={profile.completelyAlone} onValueChange={(value) => updateProfile('completelyAlone', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="alone-yes" />
                <Label htmlFor="alone-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="alone-no" />
                <Label htmlFor="alone-no">No</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )
    },
    {
      title: "Level 5: Emotional Suppression & Coping",
      content: (
        <div className="space-y-4">
          <div>
            <Label>Were you allowed to cry or show emotion as a child?</Label>
            <RadioGroup value={profile.allowedToCry} onValueChange={(value) => updateProfile('allowedToCry', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="cry-yes" />
                <Label htmlFor="cry-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="cry-no" />
                <Label htmlFor="cry-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Were your feelings dismissed with phrases like “don’t be dramatic” or “toughen up”?</Label>
            <RadioGroup value={profile.feelingsDismissed} onValueChange={(value) => updateProfile('feelingsDismissed', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="dismissed-yes" />
                <Label htmlFor="dismissed-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="dismissed-no" />
                <Label htmlFor="dismissed-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Did you learn to stay quiet to avoid conflict?</Label>
            <RadioGroup value={profile.stayedQuiet} onValueChange={(value) => updateProfile('stayedQuiet', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="quiet-yes" />
                <Label htmlFor="quiet-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="quiet-no" />
                <Label htmlFor="quiet-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Did you ever have to parent your parents emotionally?</Label>
            <RadioGroup value={profile.parentedParents} onValueChange={(value) => updateProfile('parentedParents', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="parented-yes" />
                <Label htmlFor="parented-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="parented-no" />
                <Label htmlFor="parented-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>How do you handle sadness or pain now?</Label>
            <RadioGroup value={profile.handlesSadness} onValueChange={(value) => updateProfile('handlesSadness', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="healthy" id="handle-healthy" />
                <Label htmlFor="handle-healthy">Healthy ways</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unhealthy" id="handle-unhealthy" />
                <Label htmlFor="handle-unhealthy">Unhealthy ways</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )
    },
    {
      title: "Level 6: Loss, Shock, and Trauma",
      content: (
        <div className="space-y-4">
          <div>
            <Label>Has someone close to you died, especially in childhood or youth?</Label>
            <RadioGroup value={profile.closeLoss} onValueChange={(value) => updateProfile('closeLoss', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="loss-yes" />
                <Label htmlFor="loss-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="loss-no" />
                <Label htmlFor="loss-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Have you ever experienced sexual abuse or unwanted touching?</Label>
            <RadioGroup value={profile.sexualAbuse} onValueChange={(value) => updateProfile('sexualAbuse', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="abuse-yes" />
                <Label htmlFor="abuse-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="abuse-no" />
                <Label htmlFor="abuse-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Have you witnessed violence or experienced it directly?</Label>
            <RadioGroup value={profile.witnessedViolence} onValueChange={(value) => updateProfile('witnessedViolence', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="violence-yes" />
                <Label htmlFor="violence-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="violence-no" />
                <Label htmlFor="violence-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Have you survived a life-threatening event (accident, illness, war)?</Label>
            <RadioGroup value={profile.lifeThreatening} onValueChange={(value) => updateProfile('lifeThreatening', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="threatening-yes" />
                <Label htmlFor="threatening-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="threatening-no" />
                <Label htmlFor="threatening-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Has someone ever made you feel worthless, powerless, or broken?</Label>
            <RadioGroup value={profile.madeFeelWorthless} onValueChange={(value) => updateProfile('madeFeelWorthless', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="worthless-yes" />
                <Label htmlFor="worthless-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="worthless-no" />
                <Label htmlFor="worthless-no">No</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )
    },
    {
      title: "Level 7: Current Effects (Wounds Today)",
      content: (
        <div className="space-y-4">
          <div>
            <Label>Do you struggle to trust others?</Label>
            <RadioGroup value={profile.trustStruggle} onValueChange={(value) => updateProfile('trustStruggle', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="trust-yes" />
                <Label htmlFor="trust-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="trust-no" />
                <Label htmlFor="trust-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Do you fear abandonment or rejection in relationships?</Label>
            <RadioGroup value={profile.fearAbandonment} onValueChange={(value) => updateProfile('fearAbandonment', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="abandonment-yes" />
                <Label htmlFor="abandonment-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="abandonment-no" />
                <Label htmlFor="abandonment-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Do you often feel like you're “not enough” no matter what you do?</Label>
            <RadioGroup value={profile.feelNotEnough} onValueChange={(value) => updateProfile('feelNotEnough', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="not-enough-yes" />
                <Label htmlFor="not-enough-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="not-enough-no" />
                <Label htmlFor="not-enough-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Are there emotions you’re afraid to feel or express?</Label>
            <RadioGroup value={profile.afraidToFeel} onValueChange={(value) => updateProfile('afraidToFeel', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="afraid-yes" />
                <Label htmlFor="afraid-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="afraid-no" />
                <Label htmlFor="afraid-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Do you feel disconnected from yourself or your body?</Label>
            <RadioGroup value={profile.disconnectedFromSelf} onValueChange={(value) => updateProfile('disconnectedFromSelf', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="disconnected-yes" />
                <Label htmlFor="disconnected-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="disconnected-no" />
                <Label htmlFor="disconnected-no">No</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )
    },
    {
      title: "Level 8: Repetition & Internalization",
      content: (
        <div className="space-y-4">
          <div>
            <Label>Do you attract emotionally unavailable or toxic people?</Label>
            <RadioGroup value={profile.attractToxicPeople} onValueChange={(value) => updateProfile('attractToxicPeople', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="attract-yes" />
                <Label htmlFor="attract-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="attract-no" />
                <Label htmlFor="attract-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Do you overcompensate (people-pleasing, overworking, overgiving)?</Label>
            <RadioGroup value={profile.overcompensate} onValueChange={(value) => updateProfile('overcompensate', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="overcompensate-yes" />
                <Label htmlFor="overcompensate-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="overcompensate-no" />
                <Label htmlFor="overcompensate-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Do you feel guilt or shame for setting boundaries?</Label>
            <RadioGroup value={profile.boundaryGuilt} onValueChange={(value) => updateProfile('boundaryGuilt', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="guilt-yes" />
                <Label htmlFor="guilt-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="guilt-no" />
                <Label htmlFor="guilt-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Do you believe you're hard to love or understand?</Label>
            <RadioGroup value={profile.hardToLove} onValueChange={(value) => updateProfile('hardToLove', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="hard-love-yes" />
                <Label htmlFor="hard-love-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="hard-love-no" />
                <Label htmlFor="hard-love-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Do you feel like your past still controls your present?</Label>
            <RadioGroup value={profile.pastControlsPresent} onValueChange={(value) => updateProfile('pastControlsPresent', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="past-controls-yes" />
                <Label htmlFor="past-controls-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="past-controls-no" />
                <Label htmlFor="past-controls-no">No</Label>
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
