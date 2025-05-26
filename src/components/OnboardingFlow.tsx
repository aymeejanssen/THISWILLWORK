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
  identityQuestion1?: string;
  identityQuestion2?: string;
  identityQuestion3?: string;
  identityQuestion4?: string;
  identityQuestion5?: string;
  identityQuestion6?: string;
  identityQuestion7?: string;
  identityQuestion8?: string;
  identityQuestion9?: string;
  identityQuestion10?: string;
  
  // Work subcategories
  workIssueType?: string;
  workSpecificProblem?: string;
  workQuestion1?: string;
  workQuestion2?: string;
  workQuestion3?: string;
  workQuestion4?: string;
  workQuestion5?: string;
  workQuestion6?: string;
  workQuestion7?: string;
  workQuestion8?: string;
  workQuestion9?: string;
  workQuestion10?: string;
  
  // Self-worth subcategories
  selfWorthIssueType?: string;
  selfWorthSpecificProblem?: string;
  selfWorthQuestion1?: string;
  selfWorthQuestion2?: string;
  selfWorthQuestion3?: string;
  selfWorthQuestion4?: string;
  selfWorthQuestion5?: string;
  selfWorthQuestion6?: string;
  selfWorthQuestion7?: string;
  selfWorthQuestion8?: string;
  selfWorthQuestion9?: string;
  selfWorthQuestion10?: string;
  
  // Relationship subcategories
  relationshipIssueType?: string;
  relationshipSpecificProblem?: string;
  relationshipQuestion1?: string;
  relationshipQuestion2?: string;
  relationshipQuestion3?: string;
  relationshipQuestion4?: string;
  relationshipQuestion5?: string;
  relationshipQuestion6?: string;
  relationshipQuestion7?: string;
  relationshipQuestion8?: string;
  relationshipQuestion9?: string;
  relationshipQuestion10?: string;
  
  // Loneliness subcategories
  lonelinessIssueType?: string;
  lonelinessSpecificProblem?: string;
  lonelinessQuestion1?: string;
  lonelinessQuestion2?: string;
  lonelinessQuestion3?: string;
  lonelinessQuestion4?: string;
  lonelinessQuestion5?: string;
  lonelinessQuestion6?: string;
  lonelinessQuestion7?: string;
  lonelinessQuestion8?: string;
  lonelinessQuestion9?: string;
  lonelinessQuestion10?: string;
  
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

  const getSelfWorthQuestions = () => {
    const selfWorthQuestions = [
      {
        key: 'selfWorthQuestion1',
        question: 'How do you usually speak to yourself when something goes wrong?',
        options: [
          { value: 'kind-understanding', label: 'Kind and understanding' },
          { value: 'somewhat-critical', label: 'Somewhat critical but fair' },
          { value: 'very-critical', label: 'Very critical and harsh' },
          { value: 'cruel-harsh', label: 'Cruel and unforgiving' },
          { value: 'hate-myself', label: 'I hate myself when things go wrong' }
        ]
      },
      {
        key: 'selfWorthQuestion2',
        question: 'Do you often feel like you\'re not good enough?',
        options: [
          { value: 'rarely', label: 'Rarely feel this way' },
          { value: 'sometimes', label: 'Sometimes' },
          { value: 'often', label: 'Often feel inadequate' },
          { value: 'constantly', label: 'Constantly feel not good enough' },
          { value: 'core-belief', label: 'It\'s a core belief about myself' }
        ]
      },
      {
        key: 'selfWorthQuestion3',
        question: 'Are you afraid of failure—or success?',
        options: [
          { value: 'neither', label: 'Neither particularly bothers me' },
          { value: 'failure-mostly', label: 'Mostly afraid of failure' },
          { value: 'success-mostly', label: 'Mostly afraid of success' },
          { value: 'both-equally', label: 'Both equally terrify me' },
          { value: 'paralyzed', label: 'I\'m paralyzed by both' }
        ]
      },
      {
        key: 'selfWorthQuestion4',
        question: 'Do you feel like you have to be perfect to be accepted?',
        options: [
          { value: 'no-pressure', label: 'No, I feel accepted as I am' },
          { value: 'some-pressure', label: 'Some pressure to be perfect' },
          { value: 'high-pressure', label: 'High pressure to be flawless' },
          { value: 'constant-pressure', label: 'Constant pressure to be perfect' },
          { value: 'impossible-standards', label: 'I have impossible standards for myself' }
        ]
      },
      {
        key: 'selfWorthQuestion5',
        question: 'Do you struggle with guilt or shame when prioritizing your needs?',
        options: [
          { value: 'comfortable', label: 'Comfortable prioritizing my needs' },
          { value: 'some-guilt', label: 'Some guilt occasionally' },
          { value: 'frequent-guilt', label: 'Frequent guilt and shame' },
          { value: 'overwhelming-shame', label: 'Overwhelming shame' },
          { value: 'never-prioritize', label: 'I never prioritize my needs' }
        ]
      },
      {
        key: 'selfWorthQuestion6',
        question: 'Do you avoid trying things because you expect to fail?',
        options: [
          { value: 'willing-to-try', label: 'Willing to try despite risks' },
          { value: 'hesitant-sometimes', label: 'Hesitant sometimes' },
          { value: 'often-avoid', label: 'Often avoid new challenges' },
          { value: 'almost-always', label: 'Almost always avoid trying' },
          { value: 'completely-paralyzed', label: 'Completely paralyzed by fear of failure' }
        ]
      },
      {
        key: 'selfWorthQuestion7',
        question: 'Are you uncomfortable receiving praise or attention?',
        options: [
          { value: 'comfortable', label: 'Comfortable with praise' },
          { value: 'somewhat-awkward', label: 'Somewhat awkward but okay' },
          { value: 'very-uncomfortable', label: 'Very uncomfortable' },
          { value: 'deflect-immediately', label: 'Immediately deflect or dismiss it' },
          { value: 'dont-deserve', label: 'I don\'t believe I deserve it' }
        ]
      },
      {
        key: 'selfWorthQuestion8',
        question: 'Have you ever felt that your value is tied to productivity or appearance?',
        options: [
          { value: 'never', label: 'My worth feels intrinsic' },
          { value: 'sometimes', label: 'Sometimes feel this way' },
          { value: 'often', label: 'Often tied to achievements' },
          { value: 'always', label: 'Always tied to what I do/look like' },
          { value: 'only-worth', label: 'It\'s my only source of worth' }
        ]
      },
      {
        key: 'selfWorthQuestion9',
        question: 'Do you compare yourself often to others?',
        options: [
          { value: 'rarely', label: 'Rarely compare myself' },
          { value: 'sometimes', label: 'Sometimes compare' },
          { value: 'often', label: 'Often compare myself' },
          { value: 'constantly', label: 'Constantly comparing' },
          { value: 'obsessive', label: 'Obsessive comparison that hurts me' }
        ]
      },
      {
        key: 'selfWorthQuestion10',
        question: 'What do you wish you could believe about yourself?',
        options: [
          { value: 'already-believe', label: 'I already believe good things about myself' },
          { value: 'worthy-love', label: 'That I\'m worthy of love' },
          { value: 'good-enough', label: 'That I\'m good enough as I am' },
          { value: 'capable-strong', label: 'That I\'m capable and strong' },
          { value: 'deserve-happiness', label: 'That I deserve happiness and peace' }
        ]
      }
    ];

    return selfWorthQuestions.filter(q => !profile[q.key as keyof UserProfile]);
  };

  const getWorkQuestions = () => {
    const workQuestions = [
      {
        key: 'workQuestion1',
        question: 'Do you feel constantly overwhelmed or burned out by work?',
        options: [
          { value: 'energized', label: 'Work energizes me' },
          { value: 'manageable', label: 'Manageable stress levels' },
          { value: 'often-overwhelmed', label: 'Often feel overwhelmed' },
          { value: 'constantly-burned-out', label: 'Constantly burned out' },
          { value: 'completely-exhausted', label: 'Completely exhausted and depleted' }
        ]
      },
      {
        key: 'workQuestion2',
        question: 'Does your work align with your values or drain your energy?',
        options: [
          { value: 'perfectly-aligned', label: 'Perfectly aligned with my values' },
          { value: 'mostly-aligned', label: 'Mostly aligned' },
          { value: 'neutral', label: 'Neutral, just a job' },
          { value: 'drains-energy', label: 'Drains my energy' },
          { value: 'against-values', label: 'Goes against my core values' }
        ]
      },
      {
        key: 'workQuestion3',
        question: 'Are you afraid of speaking up at work or being judged?',
        options: [
          { value: 'confident-speaking', label: 'Confident speaking up' },
          { value: 'somewhat-nervous', label: 'Somewhat nervous but do it' },
          { value: 'often-afraid', label: 'Often afraid to speak up' },
          { value: 'rarely-speak', label: 'Rarely speak up due to fear' },
          { value: 'never-speak', label: 'Never speak up, too scared' }
        ]
      },
      {
        key: 'workQuestion4',
        question: 'Do you find yourself overworking to avoid feeling inadequate?',
        options: [
          { value: 'healthy-boundaries', label: 'Maintain healthy work boundaries' },
          { value: 'sometimes-overwork', label: 'Sometimes overwork' },
          { value: 'often-overwork', label: 'Often overwork to prove myself' },
          { value: 'constantly-overwork', label: 'Constantly overworking' },
          { value: 'workaholic', label: 'I\'m a workaholic driven by insecurity' }
        ]
      },
      {
        key: 'workQuestion5',
        question: 'Does your job feel like your identity or worth depends on it?',
        options: [
          { value: 'separate-identity', label: 'My identity is separate from work' },
          { value: 'somewhat-tied', label: 'Somewhat tied to my work' },
          { value: 'heavily-tied', label: 'Heavily tied to my job performance' },
          { value: 'completely-tied', label: 'My worth completely depends on work' },
          { value: 'am-my-job', label: 'I am my job - nothing else matters' }
        ]
      },
      {
        key: 'workQuestion6',
        question: 'Do you feel stuck, lost, or uncertain about your career path?',
        options: [
          { value: 'clear-direction', label: 'Clear about my career direction' },
          { value: 'mostly-clear', label: 'Mostly clear with some uncertainty' },
          { value: 'somewhat-lost', label: 'Somewhat lost and confused' },
          { value: 'very-stuck', label: 'Very stuck and directionless' },
          { value: 'completely-lost', label: 'Completely lost and hopeless about career' }
        ]
      },
      {
        key: 'workQuestion7',
        question: 'Do you often fear you\'re not doing "enough," even when exhausted?',
        options: [
          { value: 'satisfied-efforts', label: 'Satisfied with my efforts' },
          { value: 'sometimes-doubt', label: 'Sometimes doubt if it\'s enough' },
          { value: 'often-fear', label: 'Often fear I\'m not doing enough' },
          { value: 'constant-fear', label: 'Constant fear of inadequacy' },
          { value: 'never-enough', label: 'Nothing I do ever feels like enough' }
        ]
      },
      {
        key: 'workQuestion8',
        question: 'Are you working in a toxic or emotionally unsafe environment?',
        options: [
          { value: 'safe-supportive', label: 'Safe and supportive environment' },
          { value: 'mostly-okay', label: 'Mostly okay with some issues' },
          { value: 'somewhat-toxic', label: 'Somewhat toxic atmosphere' },
          { value: 'very-toxic', label: 'Very toxic and harmful' },
          { value: 'extremely-toxic', label: 'Extremely toxic, affecting my mental health' }
        ]
      },
      {
        key: 'workQuestion9',
        question: 'Do you feel recognized and appreciated for your efforts?',
        options: [
          { value: 'well-recognized', label: 'Well recognized and appreciated' },
          { value: 'somewhat-recognized', label: 'Somewhat recognized' },
          { value: 'rarely-recognized', label: 'Rarely feel appreciated' },
          { value: 'never-recognized', label: 'Never feel recognized' },
          { value: 'actively-undervalued', label: 'Actively undervalued and dismissed' }
        ]
      },
      {
        key: 'workQuestion10',
        question: 'What would your ideal relationship with work look like?',
        options: [
          { value: 'current-ideal', label: 'My current situation is pretty ideal' },
          { value: 'balanced-fulfilling', label: 'Balanced and fulfilling' },
          { value: 'meaningful-impact', label: 'Meaningful work with real impact' },
          { value: 'stress-free', label: 'Stress-free and sustainable' },
          { value: 'passion-driven', label: 'Completely passion-driven and autonomous' }
        ]
      }
    ];

    return workQuestions.filter(q => !profile[q.key as keyof UserProfile]);
  };

  const getIdentityQuestions = () => {
    const identityQuestions = [
      {
        key: 'identityQuestion1',
        question: 'Do you feel clear about who you are, or do you often feel lost?',
        options: [
          { value: 'very-clear', label: 'Very clear about who I am' },
          { value: 'mostly-clear', label: 'Mostly clear with some questions' },
          { value: 'somewhat-lost', label: 'Somewhat lost and uncertain' },
          { value: 'very-lost', label: 'Very lost and confused' },
          { value: 'completely-lost', label: 'Completely lost, no sense of self' }
        ]
      },
      {
        key: 'identityQuestion2',
        question: 'Do you struggle with the pressure to be someone you\'re not?',
        options: [
          { value: 'authentic-always', label: 'I can be authentic most of the time' },
          { value: 'some-pressure', label: 'Some pressure occasionally' },
          { value: 'frequent-pressure', label: 'Frequent pressure to conform' },
          { value: 'constant-pressure', label: 'Constant pressure to be different' },
          { value: 'lost-real-self', label: 'I\'ve lost touch with my real self' }
        ]
      },
      {
        key: 'identityQuestion3',
        question: 'Have you ever had to hide your true self to be accepted?',
        options: [
          { value: 'never-hide', label: 'Never had to hide who I am' },
          { value: 'sometimes-hide', label: 'Sometimes hide parts of myself' },
          { value: 'often-hide', label: 'Often hide my true self' },
          { value: 'always-hide', label: 'Always hiding who I really am' },
          { value: 'dont-know-true-self', label: 'I don\'t even know my true self anymore' }
        ]
      },
      {
        key: 'identityQuestion4',
        question: 'Do you feel like your life has meaning and direction?',
        options: [
          { value: 'strong-purpose', label: 'Strong sense of purpose and meaning' },
          { value: 'general-direction', label: 'General sense of direction' },
          { value: 'searching-meaning', label: 'Searching for meaning' },
          { value: 'no-direction', label: 'No clear direction or purpose' },
          { value: 'meaningless', label: 'Life feels meaningless and empty' }
        ]
      },
      {
        key: 'identityQuestion5',
        question: 'Are you living by your values, or someone else\'s expectations?',
        options: [
          { value: 'my-values', label: 'Living by my own values' },
          { value: 'mostly-mine', label: 'Mostly my values, some external pressure' },
          { value: 'mixed', label: 'Mix of my values and others\' expectations' },
          { value: 'mostly-others', label: 'Mostly living by others\' expectations' },
          { value: 'completely-others', label: 'Completely living for others\' approval' }
        ]
      },
      {
        key: 'identityQuestion6',
        question: 'Do you feel disconnected from your culture, beliefs, or roots?',
        options: [
          { value: 'strongly-connected', label: 'Strongly connected to my roots' },
          { value: 'mostly-connected', label: 'Mostly connected' },
          { value: 'somewhat-disconnected', label: 'Somewhat disconnected' },
          { value: 'very-disconnected', label: 'Very disconnected' },
          { value: 'completely-lost', label: 'Completely lost from my origins' }
        ]
      },
      {
        key: 'identityQuestion7',
        question: 'Are you still trying to figure out who you are outside of others?',
        options: [
          { value: 'independent-identity', label: 'I have a strong independent identity' },
          { value: 'mostly-independent', label: 'Mostly independent, some codependence' },
          { value: 'still-figuring', label: 'Still figuring out who I am alone' },
          { value: 'very-dependent', label: 'Very dependent on others for identity' },
          { value: 'no-self', label: 'I don\'t exist without others defining me' }
        ]
      },
      {
        key: 'identityQuestion8',
        question: 'Do you feel safe being fully yourself in the world?',
        options: [
          { value: 'completely-safe', label: 'Completely safe being myself' },
          { value: 'mostly-safe', label: 'Mostly safe with some caution' },
          { value: 'somewhat-unsafe', label: 'Somewhat unsafe, need to be careful' },
          { value: 'very-unsafe', label: 'Very unsafe being authentic' },
          { value: 'never-safe', label: 'Never safe to be my true self' }
        ]
      },
      {
        key: 'identityQuestion9',
        question: 'Have you ever questioned your identity, sexuality, or purpose?',
        options: [
          { value: 'never-questioned', label: 'Never seriously questioned these' },
          { value: 'some-questioning', label: 'Some questioning and exploration' },
          { value: 'major-questioning', label: 'Major periods of questioning' },
          { value: 'constant-questioning', label: 'Constantly questioning everything' },
          { value: 'crisis-questioning', label: 'In crisis about who I am' }
        ]
      },
      {
        key: 'identityQuestion10',
        question: 'What kind of person are you trying to become—and why?',
        options: [
          { value: 'happy-current', label: 'Happy with who I am now' },
          { value: 'authentic-self', label: 'More authentic and true to myself' },
          { value: 'confident-strong', label: 'More confident and emotionally strong' },
          { value: 'purposeful-meaningful', label: 'More purposeful and meaningful' },
          { value: 'just-surviving', label: 'Just trying to survive and get by' }
        ]
      }
    ];

    return identityQuestions.filter(q => !profile[q.key as keyof UserProfile]);
  };

  const getLonelinessQuestions = () => {
    const lonelinessQuestions = [
      {
        key: 'lonelinessQuestion1',
        question: 'Do you often feel emotionally alone, even around people?',
        options: [
          { value: 'rarely-alone', label: 'Rarely feel emotionally alone' },
          { value: 'sometimes-alone', label: 'Sometimes feel alone in crowds' },
          { value: 'often-alone', label: 'Often feel alone even with others' },
          { value: 'always-alone', label: 'Always feel emotionally isolated' },
          { value: 'profoundly-alone', label: 'Profoundly alone no matter who\'s around' }
        ]
      },
      {
        key: 'lonelinessQuestion2',
        question: 'Do you struggle to form deep, meaningful connections?',
        options: [
          { value: 'easy-connections', label: 'Easy to form meaningful connections' },
          { value: 'some-difficulty', label: 'Some difficulty but manageable' },
          { value: 'often-struggle', label: 'Often struggle with deep connections' },
          { value: 'very-difficult', label: 'Very difficult to connect deeply' },
          { value: 'impossible', label: 'Feels impossible to truly connect' }
        ]
      },
      {
        key: 'lonelinessQuestion3',
        question: 'Do you feel misunderstood or unseen by the people in your life?',
        options: [
          { value: 'understood', label: 'Feel understood and seen' },
          { value: 'sometimes-misunderstood', label: 'Sometimes feel misunderstood' },
          { value: 'often-misunderstood', label: 'Often feel misunderstood' },
          { value: 'always-misunderstood', label: 'Always feel misunderstood' },
          { value: 'invisible', label: 'Feel completely invisible and unseen' }
        ]
      },
      {
        key: 'lonelinessQuestion4',
        question: 'Have you withdrawn from others, even when you want connection?',
        options: [
          { value: 'reach-out', label: 'I reach out when I want connection' },
          { value: 'sometimes-withdraw', label: 'Sometimes withdraw despite wanting connection' },
          { value: 'often-withdraw', label: 'Often withdraw and isolate' },
          { value: 'always-withdraw', label: 'Always withdraw from others' },
          { value: 'completely-isolated', label: 'Completely isolated myself' }
        ]
      },
      {
        key: 'lonelinessQuestion5',
        question: 'Do you feel like a burden when you reach out for help?',
        options: [
          { value: 'comfortable-asking', label: 'Comfortable asking for help' },
          { value: 'sometimes-burden', label: 'Sometimes worry I\'m a burden' },
          { value: 'often-burden', label: 'Often feel like a burden' },
          { value: 'always-burden', label: 'Always feel like I\'m bothering people' },
          { value: 'never-ask', label: 'Never ask for help because I\'m a burden' }
        ]
      },
      {
        key: 'lonelinessQuestion6',
        question: 'Have you ever felt like no one would notice if you disappeared?',
        options: [
          { value: 'would-be-missed', label: 'I know I would be missed' },
          { value: 'some-would-notice', label: 'Some people would notice' },
          { value: 'few-would-notice', label: 'Very few would notice' },
          { value: 'nobody-notice', label: 'Nobody would really notice' },
          { value: 'relief-if-gone', label: 'People would be relieved if I disappeared' }
        ]
      },
      {
        key: 'lonelinessQuestion7',
        question: 'Do you fear being vulnerable or fully known?',
        options: [
          { value: 'comfortable-vulnerable', label: 'Comfortable being vulnerable' },
          { value: 'somewhat-scared', label: 'Somewhat scared but try anyway' },
          { value: 'very-scared', label: 'Very scared of vulnerability' },
          { value: 'terrified', label: 'Terrified of being truly known' },
          { value: 'never-vulnerable', label: 'Never allow myself to be vulnerable' }
        ]
      },
      {
        key: 'lonelinessQuestion8',
        question: 'Do you avoid social situations due to anxiety or fear of rejection?',
        options: [
          { value: 'enjoy-social', label: 'Enjoy most social situations' },
          { value: 'some-anxiety', label: 'Some anxiety but participate' },
          { value: 'often-avoid', label: 'Often avoid social situations' },
          { value: 'usually-avoid', label: 'Usually avoid due to fear' },
          { value: 'completely-avoid', label: 'Completely avoid all social contact' }
        ]
      },
      {
        key: 'lonelinessQuestion9',
        question: 'Do you long for closeness but don\'t know how to get it?',
        options: [
          { value: 'know-how', label: 'I know how to create closeness' },
          { value: 'some-uncertainty', label: 'Some uncertainty but try' },
          { value: 'often-confused', label: 'Often confused about how to connect' },
          { value: 'no-idea', label: 'No idea how to create real closeness' },
          { value: 'hopeless', label: 'Feel hopeless about ever finding closeness' }
        ]
      },
      {
        key: 'lonelinessQuestion10',
        question: 'What kind of connection do you feel is missing from your life?',
        options: [
          { value: 'satisfied', label: 'I feel satisfied with my connections' },
          { value: 'deeper-friendships', label: 'Deeper, more authentic friendships' },
          { value: 'romantic-partner', label: 'A romantic partner who truly gets me' },
          { value: 'understanding-community', label: 'A community that understands me' },
          { value: 'any-real-connection', label: 'Any real connection at all' }
        ]
      }
    ];

    return lonelinessQuestions.filter(q => !profile[q.key as keyof UserProfile]);
  };

  const getRelationshipQuestions = () => {
    const relationshipQuestions = [
      {
        key: 'relationshipQuestion1',
        question: 'Do you feel safe, respected, and understood in your current or past relationships?',
        options: [
          { value: 'always', label: 'Always feel safe and respected' },
          { value: 'mostly', label: 'Mostly, with some exceptions' },
          { value: 'sometimes', label: 'Sometimes, but inconsistently' },
          { value: 'rarely', label: 'Rarely feel this way' },
          { value: 'never', label: 'Never feel safe or respected' }
        ]
      },
      {
        key: 'relationshipQuestion2',
        question: 'Do you fear abandonment or rejection in relationships?',
        options: [
          { value: 'never', label: 'Never worry about this' },
          { value: 'occasionally', label: 'Occasionally concerned' },
          { value: 'often', label: 'Often anxious about it' },
          { value: 'constantly', label: 'Constantly fearful' },
          { value: 'paralyzing', label: 'It\'s paralyzing and overwhelming' }
        ]
      },
      {
        key: 'relationshipQuestion3',
        question: 'Do you often lose yourself in relationships or over-give?',
        options: [
          { value: 'never', label: 'I maintain my identity well' },
          { value: 'sometimes', label: 'Sometimes I give too much' },
          { value: 'often', label: 'Often lose myself' },
          { value: 'always', label: 'Always sacrifice myself' },
          { value: 'completely', label: 'I completely disappear in relationships' }
        ]
      },
      {
        key: 'relationshipQuestion4',
        question: 'Have you experienced emotional or physical abuse from a partner?',
        options: [
          { value: 'never', label: 'Never experienced abuse' },
          { value: 'emotional-mild', label: 'Mild emotional mistreatment' },
          { value: 'emotional-severe', label: 'Severe emotional abuse' },
          { value: 'physical', label: 'Physical abuse' },
          { value: 'both', label: 'Both emotional and physical abuse' }
        ]
      },
      {
        key: 'relationshipQuestion5',
        question: 'Do you struggle to trust others or open up emotionally?',
        options: [
          { value: 'easy', label: 'I trust and open up easily' },
          { value: 'somewhat-difficult', label: 'Somewhat difficult' },
          { value: 'very-difficult', label: 'Very difficult to trust' },
          { value: 'nearly-impossible', label: 'Nearly impossible' },
          { value: 'walls-up', label: 'I keep walls up always' }
        ]
      },
      {
        key: 'relationshipQuestion6',
        question: 'Do your relationships tend to follow the same painful patterns?',
        options: [
          { value: 'no-patterns', label: 'No, each relationship is different' },
          { value: 'some-patterns', label: 'Some similar patterns' },
          { value: 'clear-patterns', label: 'Clear repeating patterns' },
          { value: 'same-cycle', label: 'Always the same painful cycle' },
          { value: 'trapped', label: 'I feel trapped in these patterns' }
        ]
      },
      {
        key: 'relationshipQuestion7',
        question: 'Do you find yourself choosing partners who don\'t treat you well?',
        options: [
          { value: 'never', label: 'I choose healthy partners' },
          { value: 'sometimes', label: 'Sometimes make poor choices' },
          { value: 'often', label: 'Often attracted to wrong people' },
          { value: 'always', label: 'Always end up with bad partners' },
          { value: 'cant-help', label: 'I can\'t help being drawn to toxic people' }
        ]
      },
      {
        key: 'relationshipQuestion8',
        question: 'Are you afraid of being alone, even in unhappy relationships?',
        options: [
          { value: 'comfortable-alone', label: 'I\'m comfortable being alone' },
          { value: 'prefer-company', label: 'Prefer company but okay alone' },
          { value: 'dislike-alone', label: 'Dislike being alone' },
          { value: 'afraid-alone', label: 'Afraid of being alone' },
          { value: 'terrified', label: 'Terrified of being alone' }
        ]
      },
      {
        key: 'relationshipQuestion9',
        question: 'Do you feel you have to earn love or prove your worth?',
        options: [
          { value: 'unconditional', label: 'I feel worthy of unconditional love' },
          { value: 'sometimes-prove', label: 'Sometimes feel I need to prove myself' },
          { value: 'often-earn', label: 'Often feel I must earn love' },
          { value: 'always-prove', label: 'Always trying to prove my worth' },
          { value: 'exhausting', label: 'It\'s exhausting trying to be worthy' }
        ]
      },
      {
        key: 'relationshipQuestion10',
        question: 'What part of love or connection feels most difficult for you?',
        options: [
          { value: 'none', label: 'Love and connection feel natural' },
          { value: 'vulnerability', label: 'Being vulnerable and open' },
          { value: 'trust', label: 'Trusting others completely' },
          { value: 'communication', label: 'Communicating needs and feelings' },
          { value: 'all', label: 'All aspects of love feel overwhelming' }
        ]
      }
    ];

    return relationshipQuestions.filter(q => !profile[q.key as keyof UserProfile]);
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
        } else if (profile.relationshipIssueType === 'dating') {
          specificOptions = [
            { value: 'finding-someone', label: 'Difficulty finding the right person' },
            { value: 'dating-anxiety', label: 'Anxiety about dating' },
            { value: 'past-baggage', label: 'Past relationship baggage' },
            { value: 'attachment', label: 'Attachment and intimacy issues' },
            { value: 'self-worth', label: 'Low self-worth in dating' }
          ];
        } else if (profile.relationshipIssueType === 'friendship') {
          specificOptions = [
            { value: 'making-friends', label: 'Difficulty making new friends' },
            { value: 'friendship-conflict', label: 'Conflict with existing friends' },
            { value: 'boundary-issues', label: 'Boundary issues with friends' },
            { value: 'feeling-used', label: 'Feeling used or taken advantage of' },
            { value: 'loneliness', label: 'Loneliness despite having friends' }
          ];
        } else if (profile.relationshipIssueType === 'trust') {
          specificOptions = [
            { value: 'trust-betrayal', label: 'Past betrayal affecting trust' },
            { value: 'emotional-walls', label: 'Emotional walls and barriers' },
            { value: 'intimacy-fear', label: 'Fear of emotional intimacy' },
            { value: 'vulnerability', label: 'Difficulty being vulnerable' },
            { value: 'abandonment', label: 'Fear of abandonment' }
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
      } else if (profile.selfWorthIssueType && !profile.selfWorthSpecificProblem) {
        let specificOptions = [];
        if (profile.selfWorthIssueType === 'confidence') {
          specificOptions = [
            { value: 'social-confidence', label: 'Social confidence and interactions' },
            { value: 'decision-making', label: 'Decision-making and self-trust' },
            { value: 'body-image', label: 'Body image and appearance' },
            { value: 'abilities', label: 'Doubting my abilities and skills' },
            { value: 'general-worth', label: 'General feelings of worthlessness' }
          ];
        } else if (profile.selfWorthIssueType === 'perfectionism') {
          specificOptions = [
            { value: 'fear-failure', label: 'Fear of failure or making mistakes' },
            { value: 'impossible-standards', label: 'Setting impossible standards' },
            { value: 'procrastination', label: 'Procrastination due to perfectionism' },
            { value: 'criticism-sensitivity', label: 'Extreme sensitivity to criticism' },
            { value: 'all-or-nothing', label: 'All-or-nothing thinking' }
          ];
        } else if (profile.selfWorthIssueType === 'comparison') {
          specificOptions = [
            { value: 'social-media', label: 'Social media comparison' },
            { value: 'achievements', label: 'Comparing achievements and success' },
            { value: 'relationships', label: 'Comparing relationships and love' },
            { value: 'appearance', label: 'Comparing appearance and attractiveness' },
            { value: 'life-progress', label: 'Comparing life progress and milestones' }
          ];
        } else if (profile.selfWorthIssueType === 'shame') {
          specificOptions = [
            { value: 'past-mistakes', label: 'Shame about past mistakes' },
            { value: 'identity-shame', label: 'Shame about who I am' },
            { value: 'body-shame', label: 'Body and sexuality shame' },
            { value: 'family-shame', label: 'Shame from family messages' },
            { value: 'deep-unworthiness', label: 'Deep sense of unworthiness' }
          ];
        } else if (profile.selfWorthIssueType === 'imposter') {
          specificOptions = [
            { value: 'work-imposter', label: 'Imposter syndrome at work' },
            { value: 'relationship-imposter', label: 'Feeling like a fake in relationships' },
            { value: 'success-imposter', label: 'Can\'t own my successes' },
            { value: 'social-imposter', label: 'Feeling fake in social situations' },
            { value: 'general-fraud', label: 'General feeling of being a fraud' }
          ];
        }
        
        subQuestions.push({
          title: `Self-Worth Issues - ${profile.selfWorthIssueType}`,
          content: (
            <div className="space-y-4">
              <Label>What specifically are you struggling with?</Label>
              <RadioGroup value={profile.selfWorthSpecificProblem || ''} onValueChange={(value) => updateProfile('selfWorthSpecificProblem', value)}>
                {specificOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`self-specific-${option.value}`} />
                    <Label htmlFor={`self-specific-${option.value}`}>{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )
        });
      } else if (profile.selfWorthIssueType && profile.selfWorthSpecificProblem) {
        // Add the 10 self-worth questions one by one
        const selfWorthQuestions = getSelfWorthQuestions();
        if (selfWorthQuestions.length > 0) {
          const currentQuestion = selfWorthQuestions[0];
          subQuestions.push({
            title: `Self-Worth Question ${11 - selfWorthQuestions.length}`,
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
      } else if (profile.workIssueType && !profile.workSpecificProblem) {
        let specificOptions = [];
        if (profile.workIssueType === 'burnout') {
          specificOptions = [
            { value: 'physical-exhaustion', label: 'Physical exhaustion and fatigue' },
            { value: 'emotional-depletion', label: 'Emotional depletion' },
            { value: 'cynicism', label: 'Cynicism and detachment from work' },
            { value: 'no-motivation', label: 'Complete lack of motivation' },
            { value: 'health-impacts', label: 'Physical health impacts' }
          ];
        } else if (profile.workIssueType === 'toxic-workplace') {
          specificOptions = [
            { value: 'bad-boss', label: 'Abusive or incompetent boss' },
            { value: 'toxic-colleagues', label: 'Toxic colleagues or workplace culture' },
            { value: 'discrimination', label: 'Discrimination or harassment' },
            { value: 'unrealistic-expectations', label: 'Unrealistic expectations and pressure' },
            { value: 'no-support', label: 'No support or resources' }
          ];
        } else if (profile.workIssueType === 'career-change') {
          specificOptions = [
            { value: 'wrong-field', label: 'In the wrong career field' },
            { value: 'fear-change', label: 'Fear of making a career change' },
            { value: 'financial-concerns', label: 'Financial concerns about changing' },
            { value: 'dont-know-what', label: 'Don\'t know what I want to do' },
            { value: 'starting-over', label: 'Fear of starting over' }
          ];
        } else if (profile.workIssueType === 'performance') {
          specificOptions = [
            { value: 'fear-failure', label: 'Fear of failing or making mistakes' },
            { value: 'presentations', label: 'Anxiety about presentations or meetings' },
            { value: 'imposter-work', label: 'Imposter syndrome at work' },
            { value: 'perfectionism-work', label: 'Perfectionism hindering performance' },
            { value: 'criticism-fear', label: 'Fear of criticism or negative feedback' }
          ];
        } else if (profile.workIssueType === 'work-life-balance') {
          specificOptions = [
            { value: 'overworking', label: 'Working too many hours' },
            { value: 'no-boundaries', label: 'No boundaries between work and personal life' },
            { value: 'stress-impact', label: 'Work stress impacting relationships' },
            { value: 'no-time-self', label: 'No time for self-care or hobbies' },
            { value: 'guilt-not-working', label: 'Guilt when not working' }
          ];
        }
        
        subQuestions.push({
          title: `Work Issues - ${profile.workIssueType}`,
          content: (
            <div className="space-y-4">
              <Label>What specifically are you experiencing?</Label>
              <RadioGroup value={profile.workSpecificProblem || ''} onValueChange={(value) => updateProfile('workSpecificProblem', value)}>
                {specificOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`work-specific-${option.value}`} />
                    <Label htmlFor={`work-specific-${option.value}`}>{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )
        });
      } else if (profile.workIssueType && profile.workSpecificProblem) {
        // Add the 10 work questions one by one
        const workQuestions = getWorkQuestions();
        if (workQuestions.length > 0) {
          const currentQuestion = workQuestions[0];
          subQuestions.push({
            title: `Work Question ${11 - workQuestions.length}`,
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
      } else if (profile.identityIssueType && !profile.identitySpecificProblem) {
        let specificOptions = [];
        if (profile.identityIssueType === 'purpose') {
          specificOptions = [
            { value: 'no-direction', label: 'No sense of direction or purpose' },
            { value: 'meaningless', label: 'Life feels meaningless' },
            { value: 'career-purpose', label: 'Career doesn\'t align with purpose' },
            { value: 'lost-passion', label: 'Lost touch with what I\'m passionate about' },
            { value: 'legacy-meaning', label: 'Wondering about my legacy and impact' }
          ];
        } else if (profile.identityIssueType === 'authentic-self') {
          specificOptions = [
            { value: 'dont-know-self', label: 'Don\'t know who I really am' },
            { value: 'hiding-true-self', label: 'Hiding my true self from others' },
            { value: 'people-pleasing', label: 'Being who others want me to be' },
            { value: 'lost-identity', label: 'Lost myself along the way' },
            { value: 'fear-authenticity', label: 'Fear of being authentic' }
          ];
        } else if (profile.identityIssueType === 'values') {
          specificOptions = [
            { value: 'unclear-values', label: 'Unclear about my core values' },
            { value: 'conflicting-values', label: 'Conflicting values and beliefs' },
            { value: 'living-others-values', label: 'Living by others\' values, not mine' },
            { value: 'values-changed', label: 'My values have changed and I\'m confused' },
            { value: 'values-vs-reality', label: 'Gap between my values and how I live' }
          ];
        } else if (profile.identityIssueType === 'life-transition') {
          specificOptions = [
            { value: 'major-change', label: 'Going through major life change' },
            { value: 'role-change', label: 'Changing roles (parent, career, etc.)' },
            { value: 'age-transition', label: 'Age-related identity shifts' },
            { value: 'loss-grief', label: 'Identity loss after grief or trauma' },
            { value: 'new-chapter', label: 'Starting a completely new chapter' }
          ];
        } else if (profile.identityIssueType === 'belonging') {
          specificOptions = [
            { value: 'dont-fit-anywhere', label: 'Don\'t fit in anywhere' },
            { value: 'cultural-identity', label: 'Struggling with cultural identity' },
            { value: 'family-belonging', label: 'Don\'t belong in my family' },
            { value: 'community-belonging', label: 'Can\'t find my community or tribe' },
            { value: 'outsider', label: 'Always feel like an outsider' }
          ];
        }
        
        subQuestions.push({
          title: `Identity Issues - ${profile.identityIssueType}`,
          content: (
            <div className="space-y-4">
              <Label>What specifically are you experiencing?</Label>
              <RadioGroup value={profile.identitySpecificProblem || ''} onValueChange={(value) => updateProfile('identitySpecificProblem', value)}>
                {specificOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`identity-specific-${option.value}`} />
                    <Label htmlFor={`identity-specific-${option.value}`}>{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )
        });
      } else if (profile.identityIssueType && profile.identitySpecificProblem) {
        // Add the 10 identity questions one by one
        const identityQuestions = getIdentityQuestions();
        if (identityQuestions.length > 0) {
          const currentQuestion = identityQuestions[0];
          subQuestions.push({
            title: `Identity Question ${11 - identityQuestions.length}`,
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

    // Loneliness sub-questions
    if (profile.primaryConcern === 'loneliness') {
      if (!profile.lonelinessIssueType) {
        subQuestions.push({
          title: "Loneliness Issues - Type",
          content: (
            <div className="space-y-4">
              <Label>What type of loneliness or isolation are you experiencing?</Label>
              <RadioGroup value={profile.lonelinessIssueType || ''} onValueChange={(value) => updateProfile('lonelinessIssueType', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="social-isolation" id="lonely-social" />
                  <Label htmlFor="lonely-social">Social isolation and lack of friends</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="emotional-loneliness" id="lonely-emotional" />
                  <Label htmlFor="lonely-emotional">Emotional loneliness despite having people around</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="romantic-loneliness" id="lonely-romantic" />
                  <Label htmlFor="lonely-romantic">Romantic loneliness and lack of intimate connection</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="existential-loneliness" id="lonely-existential" />
                  <Label htmlFor="lonely-existential">Existential loneliness and feeling disconnected from life</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="social-anxiety" id="lonely-anxiety" />
                  <Label htmlFor="lonely-anxiety">Social anxiety preventing connections</Label>
                </div>
              </RadioGroup>
            </div>
          )
        });
      } else if (profile.lonelinessIssueType && !profile.lonelinessSpecificProblem) {
        let specificOptions = [];
        if (profile.lonelinessIssueType === 'social-isolation') {
          specificOptions = [
            { value: 'no-friends', label: 'Have very few or no close friends' },
            { value: 'hard-making-friends', label: 'Difficulty making new friends' },
            { value: 'lost-friends', label: 'Lost touch with old friends' },
            { value: 'surface-friendships', label: 'Only have surface-level friendships' },
            { value: 'moved-isolated', label: 'Moved somewhere new and feel isolated' }
          ];
        } else if (profile.lonelinessIssueType === 'emotional-loneliness') {
          specificOptions = [
            { value: 'misunderstood', label: 'Feel misunderstood by everyone' },
            { value: 'cant-be-real', label: 'Can\'t be my real self around others' },
            { value: 'alone-in-crowd', label: 'Feel alone even in groups' },
            { value: 'no-deep-talks', label: 'No one to have deep conversations with' },
            { value: 'emotional-support', label: 'Lack of emotional support and understanding' }
          ];
        } else if (profile.lonelinessIssueType === 'romantic-loneliness') {
          specificOptions = [
            { value: 'single-lonely', label: 'Single and longing for romantic connection' },
            { value: 'lonely-in-relationship', label: 'Lonely even in a relationship' },
            { value: 'dating-struggles', label: 'Struggles with dating and finding someone' },
            { value: 'intimacy-issues', label: 'Difficulty with emotional/physical intimacy' },
            { value: 'fear-vulnerability', label: 'Fear of vulnerability preventing closeness' }
          ];
        } else if (profile.lonelinessIssueType === 'existential-loneliness') {
          specificOptions = [
            { value: 'disconnected-world', label: 'Feel disconnected from the world' },
            { value: 'no-meaning', label: 'Life feels meaningless and empty' },
            { value: 'unique-alien', label: 'Feel too different or unique to connect' },
            { value: 'spiritual-emptiness', label: 'Spiritual emptiness and disconnection' },
            { value: 'humanity-disconnect', label: 'Disconnected from humanity in general' }
          ];
        } else if (profile.lonelinessIssueType === 'social-anxiety') {
          specificOptions = [
            { value: 'fear-rejection', label: 'Fear of rejection keeps me isolated' },
            { value: 'social-situations', label: 'Avoid social situations due to anxiety' },
            { value: 'dont-know-how', label: 'Don\'t know how to connect with others' },
            { value: 'self-conscious', label: 'Too self-conscious to reach out' },
            { value: 'past-hurt', label: 'Past hurt makes it hard to trust and connect' }
          ];
        }
        
        subQuestions.push({
          title: `Loneliness Issues - ${profile.lonelinessIssueType}`,
          content: (
            <div className="space-y-4">
              <Label>What specifically are you experiencing?</Label>
              <RadioGroup value={profile.lonelinessSpecificProblem || ''} onValueChange={(value) => updateProfile('lonelinessSpecificProblem', value)}>
                {specificOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`lonely-specific-${option.value}`} />
                    <Label htmlFor={`lonely-specific-${option.value}`}>{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )
        });
      } else if (profile.lonelinessIssueType && profile.lonelinessSpecificProblem) {
        // Add the 10 loneliness questions one by one
        const lonelinessQuestions = getLonelinessQuestions();
        if (lonelinessQuestions.length > 0) {
          const currentQuestion = lonelinessQuestions[0];
          subQuestions.push({
            title: `Loneliness Question ${11 - lonelinessQuestions.length}`,
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
