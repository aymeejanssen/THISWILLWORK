import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Users, UserCircle, Briefcase, Compass, Brain, ArrowRight, Check, Shield } from 'lucide-react';
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
      icon: <Heart className="h-6 w-6" />,
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'relationships',
      title: 'Relationships',
      description: 'Romantic relationships, friendships, social connections',
      icon: <Users className="h-6 w-6" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'self-worth',
      title: 'Self-Worth & Confidence',
      description: 'Self-esteem, confidence, self-image, perfectionism',
      icon: <UserCircle className="h-6 w-6" />,
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
      description: 'Life direction, values, personal identity, meaning',
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
        "How would you describe your family environment growing up?",
        "What patterns from your childhood do you notice showing up in your adult life?",
        "How do you feel your family relationships affect your current well-being?"
      ],
      relationships: [
        "What challenges do you face most often in your relationships?",
        "How do you handle conflict or disagreement with people you care about?",
        "What would your ideal relationship dynamic look like?"
      ],
      'self-worth': [
        "What thoughts go through your mind when you look at yourself?",
        "How do you respond to mistakes or setbacks?",
        "What would change in your life if you truly believed you were enough?"
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
