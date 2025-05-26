
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Users, User, Briefcase, Compass, Brain, ArrowRight, Check, Shield, UserPlus } from 'lucide-react';
import { useAssessment } from '../contexts/AssessmentContext';

interface OnboardingFlowProps {
  onClose: () => void;
}

const OnboardingFlow = ({ onClose }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedConcern, setSelectedConcern] = useState('');
  const [responses, setResponses] = useState<string[]>([]);
  const { updateResponses } = useAssessment();

  const concerns = [
    {
      id: 'family',
      title: 'Family & Childhood',
      description: 'Family dynamics, childhood experiences, parental relationships',
      icon: <User className="h-6 w-6" />,
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'romantic-relationships',
      title: 'Romantic Relationships',
      description: 'Dating, marriage problems, partnerships, romantic connections, intimacy',
      icon: <Heart className="h-6 w-6" />,
      color: 'from-red-500 to-pink-500'
    },
    {
      id: 'friendships',
      title: 'Friendships',
      description: 'Friendships, social connections, building relationships',
      icon: <Users className="h-6 w-6" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'self-worth',
      title: 'Self-Worth & Confidence',
      description: 'Self-esteem, confidence, self-image, perfectionism',
      icon: <User className="h-6 w-6" />,
      color: 'from-purple-500 to-indigo-500'
    },
    {
      id: 'work',
      title: 'Work & Career',
      description: 'Job stress, career direction, work-life balance',
      icon: <Briefcase className="h-6 w-6" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'identity',
      title: 'Identity & Purpose',
      description: 'Life direction, sexual orientation, personal identity, values',
      icon: <Compass className="h-6 w-6" />,
      color: 'from-orange-500 to-amber-500'
    },
    {
      id: 'loneliness',
      title: 'Loneliness & Connection',
      description: 'Feeling isolated, difficulty connecting, social anxiety',
      icon: <Brain className="h-6 w-6" />,
      color: 'from-teal-500 to-cyan-500'
    },
    {
      id: 'grief',
      title: 'Grief & Loss',
      description: 'Processing loss, bereavement, major life changes',
      icon: <Heart className="h-6 w-6" />,
      color: 'from-slate-500 to-gray-500'
    },
    {
      id: 'trauma',
      title: 'Trauma/Difficult Experiences',
      description: 'Past traumatic events, difficult experiences, recovery',
      icon: <Shield className="h-6 w-6" />,
      color: 'from-red-500 to-pink-500'
    }
  ];

  const getQuestions = (concern: string) => {
    const questionSets = {
      family: [
        "Who were you closer to growing up?",
        "Did you lose a parent or caregiver during childhood?",
        "Were you raised mostly by one parent or guardian?",
        "Was there emotional or verbal abuse in your household?",
        "Did anyone in your home struggle with addiction or mental illness?",
        "Did you feel safe at home growing up?",
        "Were you often punished physically at home?",
        "Were you expected to be perfect or always perform well?",
        "Did you feel loved unconditionally by your caregivers?",
        "Were your parents emotionally available when you needed them?",
        "Did you have to take on adult responsibilities as a child?",
        "Do you still carry unresolved pain from your family dynamics?"
      ],
      'romantic-relationships': [
        "Are you currently in a relationship, married, or single?",
        "Are you going through a breakup, divorce, or separation right now?",
        "Have you recently experienced heartbreak or rejection?",
        "Was your last or current relationship emotionally fulfilling?",
        "Have you ever experienced emotional or physical abuse in a relationship?",
        "Do you feel safe expressing your needs in romantic relationships?",
        "Do you often fear being abandoned or left?",
        "Do you tend to lose yourself or over-give in relationships?",
        "Do you find yourself repeating the same unhealthy relationship patterns?",
        "Do you struggle to trust your partner or partners in general?",
        "Has infidelity or betrayal played a role in your current or past relationship?",
        "Do you feel worthy of love and affection in your relationships?"
      ],
      friendships: [
        "Did you struggle to make or keep friends growing up?",
        "Have you ever been excluded or left out by people you cared about?",
        "Were you ever bullied by someone you considered a friend?",
        "Do you often feel like the one who gives more in friendships?",
        "Have your close friends ever turned on you or betrayed your trust?",
        "Do you have trouble trusting new people or opening up emotionally?",
        "Have you lost friends because you stood up for yourself or set boundaries?",
        "Do you fear being too much or too needy in friendships?",
        "Have you ever felt like a backup option or second choice to your friends?",
        "Do you often feel lonely even when you're socially connected?",
        "Have you experienced long periods without close or supportive friendships?",
        "Do you struggle to believe people genuinely like or care about you?"
      ],
      'self-worth': [
        "Do you often feel like you're not good enough no matter what you do?",
        "Do you struggle to accept compliments or praise?",
        "Do you compare yourself to others and feel like you fall short?",
        "Do you feel like your value depends on your achievements or appearance?",
        "Do you criticize yourself harshly when you make mistakes?",
        "Do you feel guilty when you take time for yourself or say no to others?",
        "Do you worry that people will leave you if they see the \"real\" you?",
        "Have you ever felt like you had to earn love or acceptance?",
        "Do you downplay your accomplishments or avoid attention?",
        "Do you believe you're hard to love or understand?",
        "Do you avoid trying new things because you're afraid to fail?",
        "Do you often feel like you're a burden to others?"
      ],
      work: [
        "What aspects of your work life cause you the most stress?",
        "How do you handle pressure or criticism at work?",
        "What would make you feel more fulfilled professionally?"
      ],
      identity: [
        "How would you describe who you are at your core?",
        "What makes you feel most like yourself?",
        "What do you wish people understood about you?"
      ],
      loneliness: [
        "When do you feel most alone, even when others are around?",
        "What makes it difficult to connect with others?",
        "What kind of connection are you most longing for?"
      ],
      grief: [
        "What loss or change has been most difficult for you to process?",
        "How has this loss affected your daily life and relationships?",
        "What would healing or acceptance look like for you?"
      ],
      trauma: [
        "How do past difficult experiences affect your daily life now?",
        "What helps you feel safe and grounded when you're struggling?",
        "What would feeling healed or at peace look like for you?"
      ]
    };

    return questionSets[concern as keyof typeof questionSets] || [];
  };

  const handleConcernSelect = (concernId: string) => {
    setSelectedConcern(concernId);
    setCurrentStep(1);
    updateResponses('primaryConcern', concernId);
  };

  const handleResponseSubmit = (response: string) => {
    const newResponses = [...responses, response];
    setResponses(newResponses);
    
    const questionKey = `${selectedConcern}Responses`;
    updateResponses(questionKey, newResponses);
    
    const questions = getQuestions(selectedConcern);
    if (newResponses.length >= questions.length) {
      onClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const renderQuestions = () => {
    const questions = getQuestions(selectedConcern);
    const currentQuestion = questions[responses.length];
    
    if (!currentQuestion) return null;

    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              Question {responses.length + 1} of {questions.length}
            </Badge>
            <div className="flex gap-1">
              {Array.from({ length: questions.length }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < responses.length ? 'bg-purple-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
          <CardTitle className="text-xl">{currentQuestion}</CardTitle>
        </CardHeader>
        <CardContent>
          <QuestionInput onSubmit={handleResponseSubmit} />
        </CardContent>
      </Card>
    );
  };

  if (currentStep === 0) {
    return (
      <div className="p-8 max-h-[80vh] overflow-y-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What would you like to focus on today?
          </h2>
          <p className="text-gray-600 text-lg">
            Choose the area that feels most important to explore right now
          </p>
        </div>

        <div className="grid gap-4 max-w-4xl mx-auto">
          {concerns.map((concern) => (
            <Card
              key={concern.id}
              className="cursor-pointer hover:shadow-md transition-all duration-200 group"
              onClick={() => handleConcernSelect(concern.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${concern.color} text-white group-hover:scale-110 transition-transform`}>
                    {concern.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {concern.title}
                    </h3>
                    <p className="text-gray-600 mt-1">{concern.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-h-[80vh] overflow-y-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : setCurrentStep(0)}
          className="mb-4"
        >
          ← Back
        </Button>
      </div>
      {renderQuestions()}
    </div>
  );
};

const QuestionInput = ({ onSubmit }: { onSubmit: (response: string) => void }) => {
  const [response, setResponse] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (response.trim()) {
      onSubmit(response.trim());
      setResponse('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        placeholder="Take your time to reflect and share what feels true for you..."
        className="min-h-[120px] resize-none"
        autoFocus
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!response.trim()}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

export default OnboardingFlow;
