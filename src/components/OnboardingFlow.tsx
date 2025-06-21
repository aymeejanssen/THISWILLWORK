import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Users, User, Briefcase, Compass, Brain, ArrowRight, Check, Shield, UserPlus, HelpCircle } from 'lucide-react';
import { useAssessment } from '../contexts/AssessmentContext';
import { useNavigate } from 'react-router-dom';
import VoiceInput from './VoiceInput';

interface OnboardingFlowProps {
  onClose: () => void;
}

const OnboardingFlow = ({
  onClose
}: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedConcern, setSelectedConcern] = useState('');
  const [responses, setResponses] = useState<string[]>([]);
  const {
    updateResponses,
    completeAssessment
  } = useAssessment();
  const navigate = useNavigate();

  const concerns = [{
    id: 'family',
    title: 'Family & Childhood',
    description: 'Family dynamics, childhood experiences, parental relationships',
    icon: <User className="h-6 w-6" />,
    color: 'from-pink-500 to-rose-500'
  }, {
    id: 'loneliness',
    title: 'Loneliness & Connection',
    description: 'Feeling isolated, difficulty connecting, social anxiety',
    icon: <Brain className="h-6 w-6" />,
    color: 'from-teal-500 to-cyan-500'
  }, {
    id: 'romantic-relationships',
    title: 'Romantic Relationships',
    description: 'Dating, marriage problems, partnerships, romantic connections, intimacy',
    icon: <Heart className="h-6 w-6" />,
    color: 'from-red-500 to-pink-500'
  }, {
    id: 'friendships',
    title: 'Friendships',
    description: 'Friendships, social connections, building relationships',
    icon: <Users className="h-6 w-6" />,
    color: 'from-blue-500 to-cyan-500'
  }, {
    id: 'self-worth',
    title: 'Self-Worth & Confidence',
    description: 'Self-esteem, confidence, self-image, perfectionism',
    icon: <User className="h-6 w-6" />,
    color: 'from-purple-500 to-indigo-500'
  }, {
    id: 'work',
    title: 'Work & Career',
    description: 'Job stress, career direction, work-life balance',
    icon: <Briefcase className="h-6 w-6" />,
    color: 'from-green-500 to-emerald-500'
  }, {
    id: 'identity',
    title: 'Identity & Purpose',
    description: 'Life direction, sexual orientation, personal identity, values',
    icon: <Compass className="h-6 w-6" />,
    color: 'from-orange-500 to-amber-500'
  }, {
    id: 'grief',
    title: 'Grief & Loss',
    description: 'Processing loss, bereavement, major life changes',
    icon: <Heart className="h-6 w-6" />,
    color: 'from-slate-500 to-gray-500'
  }, {
    id: 'trauma',
    title: 'Trauma/Difficult Experiences',
    description: 'Past traumatic events, difficult experiences, recovery',
    icon: <Shield className="h-6 w-6" />,
    color: 'from-red-500 to-pink-500'
  }, {
    id: 'other',
    title: 'Other/Something Else',
    description: 'I\'m going through something different that doesn\'t fit the above categories',
    icon: <HelpCircle className="h-6 w-6" />,
    color: 'from-gray-500 to-slate-500'
  }];

  const getQuestions = (concern: string) => {
    const questionSets = {
      family: ["Who were you closer to growing up?", "Did you lose a parent or caregiver during childhood?", "Were you raised mostly by one parent or guardian?", "Was there emotional or verbal abuse in your household?", "Did anyone in your home struggle with addiction or mental illness?", "Did you feel safe at home growing up?", "Were you often punished physically at home?", "Were you expected to be perfect or always perform well?", "Did you feel loved unconditionally by your caregivers?", "Were your parents emotionally available when you needed them?", "Did you have to take on adult responsibilities as a child?", "Do you still carry unresolved pain from your family dynamics?"],
      'romantic-relationships': ["Are you currently in a relationship, married, or single?", "Are you going through a breakup, divorce, or separation right now?", "Have you recently experienced heartbreak or rejection?", "Was your last or current relationship emotionally fulfilling?", "Have you ever experienced emotional or physical abuse in a relationship?", "Do you feel safe expressing your needs in romantic relationships?", "Do you often fear being abandoned or left?", "Do you tend to lose yourself or over-give in relationships?", "Do you find yourself repeating the same unhealthy relationship patterns?", "Do you struggle to trust your partner or partners in general?", "Has infidelity or betrayal played a role in your current or past relationship?", "Do you feel worthy of love and affection in your relationships?"],
      friendships: ["Did you struggle to make or keep friends growing up?", "Have you ever been excluded or left out by people you cared about?", "Were you ever bullied by someone you considered a friend?", "Do you often feel like the one who gives more in friendships?", "Have your close friends ever turned on you or betrayed your trust?", "Do you have trouble trusting new people or opening up emotionally?", "Have you lost friends because you stood up for yourself or set boundaries?", "Do you fear being too much or too needy in friendships?", "Have you ever felt like a backup option or second choice to your friends?", "Do you often feel lonely even when you're socially connected?", "Have you experienced long periods without close or supportive friendships?", "Do you struggle to believe people genuinely like or care about you?"],
      'self-worth': ["Do you often feel like you're not good enough no matter what you do?", "Do you struggle to accept compliments or praise?", "Do you compare yourself to others and feel like you fall short?", "Do you feel like your value depends on your achievements or appearance?", "Do you criticize yourself harshly when you make mistakes?", "Do you feel guilty when you take time for yourself or say no to others?", "Do you worry that people will leave you if they see the \"real\" you?", "Have you ever felt like you had to earn love or acceptance?", "Do you downplay your accomplishments or avoid attention?", "Do you believe you're hard to love or understand?", "Do you avoid trying new things because you're afraid to fail?", "Do you often feel like you're a burden to others?"],
      work: ["Do you feel constantly overwhelmed or burned out by your job or responsibilities?", "Do you often feel like you're falling behind, no matter how much you do?", "Do you feel pressure to always be perfect or high-performing at work?", "Do you feel anxious or uneasy around your boss or authority figures?", "Have you ever stayed in a job that drained you emotionally or mentally?", "Do you struggle to switch off or relax outside of work hours?", "Do you tie your self-worth to how productive or successful you are?", "Have you experienced toxic leadership, micromanagement, or workplace bullying?", "Do you fear speaking up at work, even when something feels wrong?", "Are you working in a job that doesn't align with who you are or want to be?", "Do you ever feel invisible, underappreciated, or replaceable at work?", "Do you feel stuck in your career path and unsure how to change it?"],
      identity: ["Do you feel clear about who you are at this stage of your life?", "Do you ever feel like you're living a version of yourself that others expect, not who you really are?", "Have you ever struggled to express your true thoughts, beliefs, or personality openly?", "Do you often question your life path, direction, or purpose?", "Do you feel pressure to follow a career, role, or lifestyle that doesn't reflect you?", "Have you ever felt disconnected from your cultural, religious, or family identity?", "Do you feel safe expressing your gender or sexual identity openly?", "Have you ever hidden parts of your identity out of fear of judgment or rejection?", "Do you question your sexual orientation or feel confused about your attractions?", "Have you ever felt like you don't belong anywhere—socially, culturally, or emotionally?", "Do you feel like you're still trying to find out who you really are?", "Do you feel ashamed or uncertain about expressing your true self?"],
      loneliness: ["Do you often feel emotionally alone, even when you're around other people?", "Do you currently have someone you can talk to about how you really feel?", "Do you struggle to form close or meaningful connections?", "Do you often feel misunderstood or unseen by those around you?", "Do you avoid reaching out because you worry you'll be a burden?", "Have you gone through long periods without close friendships or connection?", "Do you fear being vulnerable or truly known by others?", "Do you find it easier to isolate yourself than to explain your feelings?", "Do you feel like people only value you when you're useful or entertaining?", "Do you feel disconnected from the world or like you don't quite belong anywhere?", "Do you avoid social situations due to anxiety, discomfort, or fear of rejection?", "Do you crave deeper connection but feel unsure how to create it?"],
      grief: ["Have you lost someone close to you, such as a family member, partner, or friend?", "Was the loss sudden, traumatic, or difficult to process?", "Do you feel like you've had the space or support to grieve properly?", "Do you still carry unspoken words or emotions related to your loss?", "Has your life felt different or emptier since the loss?", "Do you feel like others expect you to \"move on\" before you're ready?", "Do certain dates, places, or memories trigger intense feelings of grief?", "Do you avoid thinking or talking about your loss because it's too painful?", "Have you ever lost someone emotionally, through abandonment, estrangement, or disconnection?", "Have you experienced grief from a non-death loss, such as a breakup, miscarriage, or lost dream?", "Do you feel isolated in your grief, as if no one truly understands it?", "Do you sometimes feel guilt, anger, or confusion related to your loss?"],
      trauma: ["Have you experienced a situation where you felt completely unsafe or powerless?", "Were you ever hurt emotionally by someone you trusted deeply?", "Have you experienced physical harm, violence, or aggression from someone close to you?", "Did you grow up in a household with constant fear, conflict, or unpredictability?", "Have you ever experienced unwanted touching or sexual boundaries being crossed?", "Were you exposed to emotional neglect or made to feel invisible for long periods of time?", "Have you ever been in a situation where your life or safety felt at risk (accident, assault, disaster)?", "Have you witnessed serious harm, violence, or trauma happening to someone else?", "Did you have to take on adult responsibilities too early because of a difficult home life?", "Have you experienced a controlling or manipulative relationship that left lasting effects?", "Do certain places, sounds, or situations trigger fear or panic without a clear reason?", "Do you often feel disconnected from your body, emotions, or like you're just \"getting through the day\"?"],
      other: ["Please tell me more about what you're going through. Take as much space as you need to describe your situation, feelings, and what's been weighing on your mind."]
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

    // For "other" category, we only have one open-ended question
    if (selectedConcern === 'other' || newResponses.length >= questions.length) {
      // Complete the assessment and navigate to the new summary page with AI insights and trial chat
      completeAssessment();
      onClose(); // Close the modal
      navigate('/assessment-summary'); // <-- Go to summary, not complete page
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const renderQuestions = () => {
    const questions = getQuestions(selectedConcern);
    const currentQuestion = questions[responses.length];
    
    if (!currentQuestion) return null;

    // Special handling for "other" category
    const isOtherCategory = selectedConcern === 'other';
    const questionNumber = isOtherCategory ? 1 : responses.length + 1;
    const totalQuestions = isOtherCategory ? 1 : questions.length;

    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              Question {questionNumber} of {totalQuestions}
            </Badge>
            {!isOtherCategory && (
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
            )}
          </div>
          <CardTitle className="text-xl">{currentQuestion}</CardTitle>
        </CardHeader>
        <CardContent>
          <QuestionInput onSubmit={handleResponseSubmit} isOtherCategory={isOtherCategory} />
        </CardContent>
      </Card>
    );
  };

  if (currentStep === 0) {
    return (
      <div className="p-8 max-h-[80vh] overflow-y-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4 text-slate-50">
            What would you like to focus on?
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
          onClick={() => (currentStep > 1 ? setCurrentStep(currentStep - 1) : setCurrentStep(0))}
          className="mb-4"
        >
          ← Back
        </Button>
      </div>
      {renderQuestions()}
    </div>
  );
};

const QuestionInput = ({
  onSubmit,
  isOtherCategory = false
}: {
  onSubmit: (response: string) => void;
  isOtherCategory?: boolean;
}) => {
  const [response, setResponse] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (response.trim()) {
      onSubmit(response.trim());
      setResponse('');
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    console.log('Voice transcript received:', transcript);
    setResponse((prev) => prev + ' ' + transcript);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        placeholder={
          isOtherCategory 
            ? "Please share as much detail as you'd like about what you're going through. There's no rush - take your time to express yourself fully..."
            : "Type your answer here, or use the microphone to speak..."
        }
        className={`${isOtherCategory ? 'min-h-[200px]' : 'min-h-[120px]'} resize-none`}
        autoFocus
      />
      
      <div className="flex justify-between items-center">
        <VoiceInput
          onTranscript={handleVoiceTranscript}
          isListening={isListening}
          onListeningChange={setIsListening}
        />
        
        <Button
          type="submit"
          disabled={!response.trim()}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isOtherCategory ? 'Submit My Answers' : 'Continue'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      {isListening && (
        <div className="text-sm text-gray-600 italic">
          🎤 Listening... Speak your answer now
        </div>
      )}
    </form>
  );
};

export default OnboardingFlow;
