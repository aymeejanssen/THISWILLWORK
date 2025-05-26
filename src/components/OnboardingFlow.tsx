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
  
  // Main categories and their sub-questions
  primaryConcern: string;
  
  // Family subcategories
  familyIssueType?: string;
  familySpecificProblem?: string;
  familyQuestion1?: string;
  familyQuestion2?: string;
  familyQuestion3?: string;
  familyQuestion4?: string;
  familyQuestion5?: string;
  familyQuestion6?: string;
  familyQuestion7?: string;
  familyQuestion8?: string;
  familyQuestion9?: string;
  familyQuestion10?: string;
  
  // Identity subcategories  
  identityIssueType?: string;
  identitySpecificProblem?: string;
  
  // Work subcategories
  workIssueType?: string;
  workSpecificProblem?: string;
  
  // Self-worth subcategories
  selfWorthIssueType?: string;
  selfWorthSpecificProblem?: string;
  
  // Relationship subcategories
  relationshipIssueType?: string;
  relationshipSpecificProblem?: string;
  
  // Additional responses
  [key: string]: string | undefined;
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
    primaryConcern: ''
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

  const getFamilyQuestions = () => {
    const familyQuestions = [
      {
        key: 'familyQuestion1',
        question: 'How would you describe your relationship with your parents growing up?',
        options: [
          { value: 'very-close', label: 'Very close and supportive' },
          { value: 'somewhat-close', label: 'Somewhat close but complicated' },
          { value: 'distant', label: 'Distant or disconnected' },
          { value: 'conflicted', label: 'Conflicted or stressful' },
          { value: 'abusive', label: 'Abusive or harmful' }
        ]
      },
      {
        key: 'familyQuestion2',
        question: 'Do you feel emotionally supported by your family today?',
        options: [
          { value: 'yes-very', label: 'Yes, very supported' },
          { value: 'sometimes', label: 'Sometimes, but inconsistently' },
          { value: 'rarely', label: 'Rarely feel supported' },
          { value: 'no-never', label: 'No, never feel supported' },
          { value: 'no-contact', label: 'We have no contact' }
        ]
      },
      {
        key: 'familyQuestion3',
        question: 'Were emotions openly discussed in your household?',
        options: [
          { value: 'yes-healthy', label: 'Yes, in healthy ways' },
          { value: 'sometimes', label: 'Sometimes, but awkwardly' },
          { value: 'rarely', label: 'Rarely discussed' },
          { value: 'never', label: 'Never discussed' },
          { value: 'negatively', label: 'Only negative emotions were expressed' }
        ]
      },
      {
        key: 'familyQuestion4',
        question: 'Did you ever feel responsible for keeping peace in the family?',
        options: [
          { value: 'never', label: 'Never' },
          { value: 'sometimes', label: 'Sometimes' },
          { value: 'often', label: 'Often' },
          { value: 'always', label: 'Always felt responsible' },
          { value: 'parentified', label: 'I was the family peacekeeper/parent' }
        ]
      },
      {
        key: 'familyQuestion5',
        question: 'Was there a lot of conflict, criticism, or tension at home?',
        options: [
          { value: 'none', label: 'Very little conflict' },
          { value: 'occasional', label: 'Occasional disagreements' },
          { value: 'frequent', label: 'Frequent arguments' },
          { value: 'constant', label: 'Constant tension' },
          { value: 'toxic', label: 'Toxic and hostile environment' }
        ]
      },
      {
        key: 'familyQuestion6',
        question: 'Have you ever felt like the "black sheep" in your family?',
        options: [
          { value: 'never', label: 'Never' },
          { value: 'sometimes', label: 'Sometimes' },
          { value: 'often', label: 'Often' },
          { value: 'always', label: 'Always felt different' },
          { value: 'rejected', label: 'Actively rejected or excluded' }
        ]
      },
      {
        key: 'familyQuestion7',
        question: 'Did you experience favoritism or emotional neglect?',
        options: [
          { value: 'none', label: 'No, treated fairly' },
          { value: 'mild-favoritism', label: 'Mild favoritism toward siblings' },
          { value: 'clear-favoritism', label: 'Clear favoritism, I was less favored' },
          { value: 'emotional-neglect', label: 'Emotional neglect or indifference' },
          { value: 'severe-neglect', label: 'Severe emotional abandonment' }
        ]
      },
      {
        key: 'familyQuestion8',
        question: 'Have you ever been physically or emotionally harmed by a family member?',
        options: [
          { value: 'never', label: 'Never' },
          { value: 'mild-emotional', label: 'Mild emotional harm (criticism, yelling)' },
          { value: 'severe-emotional', label: 'Severe emotional abuse' },
          { value: 'physical', label: 'Physical harm' },
          { value: 'both', label: 'Both physical and emotional abuse' }
        ]
      },
      {
        key: 'familyQuestion9',
        question: 'Do you find it hard to set boundaries with family members?',
        options: [
          { value: 'easy', label: 'Easy to set boundaries' },
          { value: 'somewhat-hard', label: 'Somewhat difficult' },
          { value: 'very-hard', label: 'Very difficult' },
          { value: 'impossible', label: 'Nearly impossible' },
          { value: 'no-boundaries', label: 'I have no boundaries with them' }
        ]
      },
      {
        key: 'familyQuestion10',
        question: 'Do family expectations ever make you feel trapped, judged, or unseen?',
        options: [
          { value: 'never', label: 'Never' },
          { value: 'sometimes', label: 'Sometimes' },
          { value: 'often', label: 'Often' },
          { value: 'always', label: 'Always feel this way' },
          { value: 'suffocating', label: 'It feels suffocating' }
        ]
      }
    ];

    return familyQuestions.filter(q => !profile[q.key as keyof UserProfile]);
  };

  const getSubQuestions = () => {
    const subQuestions = [];
    
    // Family sub-questions
    if (profile.primaryConcern === 'family') {
      if (!profile.familyIssueType) {
        subQuestions.push({
          title: "Family Issues - Type",
          content: (
            <div className="space-y-4">
              <Label>What type of family issue are you dealing with?</Label>
              <RadioGroup value={profile.familyIssueType || ''} onValueChange={(value) => updateProfile('familyIssueType', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="parents" id="family-parents" />
                  <Label htmlFor="family-parents">Issues with parents</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="siblings" id="family-siblings" />
                  <Label htmlFor="family-siblings">Sibling conflicts</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="extended" id="family-extended" />
                  <Label htmlFor="family-extended">Extended family drama</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="childhood" id="family-childhood" />
                  <Label htmlFor="family-childhood">Childhood family trauma</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="caregiving" id="family-caregiving" />
                  <Label htmlFor="family-caregiving">Caring for aging parents</Label>
                </div>
              </RadioGroup>
            </div>
          )
        });
      } else if (profile.familyIssueType && !profile.familySpecificProblem) {
        // Specific family sub-questions based on type
        let specificOptions = [];
        if (profile.familyIssueType === 'parents') {
          specificOptions = [
            { value: 'communication', label: 'Communication problems' },
            { value: 'disapproval', label: 'They disapprove of my choices' },
            { value: 'control', label: 'They try to control my life' },
            { value: 'emotional-abuse', label: 'Emotional abuse or manipulation' },
            { value: 'boundaries', label: 'Setting healthy boundaries' }
          ];
        } else if (profile.familyIssueType === 'childhood') {
          specificOptions = [
            { value: 'neglect', label: 'Emotional neglect' },
            { value: 'abuse', label: 'Physical or emotional abuse' },
            { value: 'divorce', label: 'Parents\' divorce trauma' },
            { value: 'instability', label: 'Unstable home environment' },
            { value: 'parentification', label: 'Had to act like the parent' }
          ];
        }
        
        subQuestions.push({
          title: `Family Issues - ${profile.familyIssueType}`,
          content: (
            <div className="space-y-4">
              <Label>What specifically about {profile.familyIssueType} is troubling you?</Label>
              <RadioGroup value={profile.familySpecificProblem || ''} onValueChange={(value) => updateProfile('familySpecificProblem', value)}>
                {specificOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`family-specific-${option.value}`} />
                    <Label htmlFor={`family-specific-${option.value}`}>{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )
        });
      } else if (profile.familyIssueType && profile.familySpecificProblem) {
        // Add the 10 family questions one by one
        const familyQuestions = getFamilyQuestions();
        if (familyQuestions.length > 0) {
          const currentQuestion = familyQuestions[0];
          subQuestions.push({
            title: `Family Question ${11 - familyQuestions.length}`,
            content: (
              <div className="space-y-4">
                <Label>{currentQuestion.question}</Label>
                <RadioGroup 
                  value={profile[currentQuestion.key as keyof UserProfile] || ''} 
                  onValueChange={(value) => updateProfile(currentQuestion.key as keyof UserProfile, value)}
                >
                  {currentQuestion.options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`${currentQuestion.key}-${option.value}`} />
                      <Label htmlFor={`${currentQuestion.key}-${option.value}`}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )
          });
        }
      }
    }

    // Relationship sub-questions
    if (profile.primaryConcern === 'relationships') {
      if (!profile.relationshipIssueType) {
        subQuestions.push({
          title: "Relationship Issues - Type",
          content: (
            <div className="space-y-4">
              <Label>What type of relationship issue are you experiencing?</Label>
              <RadioGroup value={profile.relationshipIssueType || ''} onValueChange={(value) => updateProfile('relationshipIssueType', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="marriage-therapy" id="rel-marriage" />
                  <Label htmlFor="rel-marriage">Marriage/partnership problems</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="breakup" id="rel-breakup" />
                  <Label htmlFor="rel-breakup">Recent breakup or divorce</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dating" id="rel-dating" />
                  <Label htmlFor="rel-dating">Dating struggles</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="friendship" id="rel-friendship" />
                  <Label htmlFor="rel-friendship">Friendship issues</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="trust" id="rel-trust" />
                  <Label htmlFor="rel-trust">Trust and intimacy issues</Label>
                </div>
              </RadioGroup>
            </div>
          )
        });
      } else if (profile.relationshipIssueType && !profile.relationshipSpecificProblem) {
        let specificOptions = [];
        if (profile.relationshipIssueType === 'marriage-therapy') {
          specificOptions = [
            { value: 'communication', label: 'Communication breakdown' },
            { value: 'infidelity', label: 'Infidelity or trust issues' },
            { value: 'intimacy', label: 'Lost emotional or physical intimacy' },
            { value: 'conflict', label: 'Constant fighting' },
            { value: 'growing-apart', label: 'Growing apart' }
          ];
        } else if (profile.relationshipIssueType === 'breakup') {
          specificOptions = [
            { value: 'grief', label: 'Grieving the loss' },
            { value: 'anger', label: 'Anger and resentment' },
            { value: 'moving-on', label: 'Difficulty moving on' },
            { value: 'self-blame', label: 'Blaming myself' },
            { value: 'co-parenting', label: 'Co-parenting challenges' }
          ];
        }
        
        subQuestions.push({
          title: `Relationship Issues - ${profile.relationshipIssueType}`,
          content: (
            <div className="space-y-4">
              <Label>What specifically are you struggling with?</Label>
              <RadioGroup value={profile.relationshipSpecificProblem || ''} onValueChange={(value) => updateProfile('relationshipSpecificProblem', value)}>
                {specificOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`rel-specific-${option.value}`} />
                    <Label htmlFor={`rel-specific-${option.value}`}>{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )
        });
      }
    }

    // Self-worth sub-questions
    if (profile.primaryConcern === 'self-worth') {
      if (!profile.selfWorthIssueType) {
        subQuestions.push({
          title: "Self-Worth Issues - Type",
          content: (
            <div className="space-y-4">
              <Label>What aspect of self-worth are you struggling with?</Label>
              <RadioGroup value={profile.selfWorthIssueType || ''} onValueChange={(value) => updateProfile('selfWorthIssueType', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="confidence" id="self-confidence" />
                  <Label htmlFor="self-confidence">Low confidence</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="perfectionism" id="self-perfectionism" />
                  <Label htmlFor="self-perfectionism">Perfectionism</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="comparison" id="self-comparison" />
                  <Label htmlFor="self-comparison">Comparing myself to others</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="shame" id="self-shame" />
                  <Label htmlFor="self-shame">Deep shame or guilt</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="imposter" id="self-imposter" />
                  <Label htmlFor="self-imposter">Imposter syndrome</Label>
                </div>
              </RadioGroup>
            </div>
          )
        });
      }
    }

    // Work sub-questions
    if (profile.primaryConcern === 'work') {
      if (!profile.workIssueType) {
        subQuestions.push({
          title: "Work Issues - Type",
          content: (
            <div className="space-y-4">
              <Label>What type of work-related issue are you experiencing?</Label>
              <RadioGroup value={profile.workIssueType || ''} onValueChange={(value) => updateProfile('workIssueType', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="burnout" id="work-burnout" />
                  <Label htmlFor="work-burnout">Burnout and exhaustion</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="toxic-workplace" id="work-toxic" />
                  <Label htmlFor="work-toxic">Toxic workplace or boss</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="career-change" id="work-career" />
                  <Label htmlFor="work-career">Career change anxiety</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="performance" id="work-performance" />
                  <Label htmlFor="work-performance">Performance anxiety</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="work-life-balance" id="work-balance" />
                  <Label htmlFor="work-balance">Work-life balance</Label>
                </div>
              </RadioGroup>
            </div>
          )
        });
      }
    }

    // Identity sub-questions
    if (profile.primaryConcern === 'identity') {
      if (!profile.identityIssueType) {
        subQuestions.push({
          title: "Identity Issues - Type",
          content: (
            <div className="space-y-4">
              <Label>What aspect of identity are you questioning?</Label>
              <RadioGroup value={profile.identityIssueType || ''} onValueChange={(value) => updateProfile('identityIssueType', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="purpose" id="identity-purpose" />
                  <Label htmlFor="identity-purpose">Life purpose and meaning</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="authentic-self" id="identity-authentic" />
                  <Label htmlFor="identity-authentic">Being my authentic self</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="values" id="identity-values" />
                  <Label htmlFor="identity-values">My values and beliefs</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="life-transition" id="identity-transition" />
                  <Label htmlFor="identity-transition">Major life transition</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="belonging" id="identity-belonging" />
                  <Label htmlFor="identity-belonging">Where I belong</Label>
                </div>
              </RadioGroup>
            </div>
          )
        });
      }
    }

    return subQuestions;
  };

  const mainSteps = [
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
      title: "Primary Concern",
      content: (
        <div className="space-y-4">
          <Label>What area of your life feels the most painful or challenging right now?</Label>
          <RadioGroup value={profile.primaryConcern} onValueChange={(value) => updateProfile('primaryConcern', value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="family" id="concern-family" />
              <Label htmlFor="concern-family">Family relationships and dynamics</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="relationships" id="concern-relationships" />
              <Label htmlFor="concern-relationships">Romantic relationships and marriage</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="self-worth" id="concern-self-worth" />
              <Label htmlFor="concern-self-worth">Self-worth and confidence</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="work" id="concern-work" />
              <Label htmlFor="concern-work">Work and career stress</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="identity" id="concern-identity" />
              <Label htmlFor="concern-identity">Identity and life purpose</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="loneliness" id="concern-loneliness" />
              <Label htmlFor="concern-loneliness">Loneliness and isolation</Label>
            </div>
          </RadioGroup>
        </div>
      )
    }
  ];

  const allSteps = [...mainSteps, ...getSubQuestions()];
  const totalSteps = allSteps.length;

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
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
              {allSteps[currentStep].title}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="text-sm opacity-90">
            Step {currentStep + 1} of {totalSteps}
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[60vh]">
          {allSteps[currentStep].content}
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
            {currentStep === totalSteps - 1 ? 'Start Talking' : 'Continue'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default OnboardingFlow;
