
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const questions = [
  {
    id: 1,
    question: "How would you describe your overall mood in the past two weeks?",
    type: "radio",
    options: [
      { value: "very_positive", label: "Very positive and upbeat" },
      { value: "mostly_positive", label: "Mostly positive with some ups and downs" },
      { value: "neutral", label: "Neutral, neither particularly good nor bad" },
      { value: "mostly_negative", label: "Mostly negative or down" },
      { value: "very_negative", label: "Very negative, feeling quite low" }
    ]
  },
  {
    id: 2,
    question: "How often do you feel anxious or worried?",
    type: "radio",
    options: [
      { value: "never", label: "Never or almost never" },
      { value: "occasionally", label: "Occasionally, but it doesn't interfere with my life" },
      { value: "sometimes", label: "Sometimes, and it affects some activities" },
      { value: "often", label: "Often, and it significantly impacts my daily life" },
      { value: "constantly", label: "Almost constantly, it's very difficult to manage" }
    ]
  },
  {
    id: 3,
    question: "How well are you sleeping lately?",
    type: "radio",
    options: [
      { value: "excellent", label: "Very well, feeling rested" },
      { value: "good", label: "Generally good with occasional bad nights" },
      { value: "fair", label: "Fair, some difficulty falling or staying asleep" },
      { value: "poor", label: "Poor, frequent sleep problems" },
      { value: "very_poor", label: "Very poor, chronic sleep issues" }
    ]
  },
  {
    id: 4,
    question: "How connected do you feel to others in your life?",
    type: "radio",
    options: [
      { value: "very_connected", label: "Very connected, strong relationships" },
      { value: "mostly_connected", label: "Mostly connected with good support" },
      { value: "somewhat_connected", label: "Somewhat connected but could be better" },
      { value: "disconnected", label: "Feeling quite disconnected or isolated" },
      { value: "very_isolated", label: "Very isolated and alone" }
    ]
  },
  {
    id: 5,
    question: "What is your primary concern or challenge right now?",
    type: "textarea",
    placeholder: "Please share what's been on your mind lately..."
  }
];

const SimpleAssessment = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});

  const handleResponse = (questionId: number, value: string) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Navigate to results with responses
      navigate('/simple-results', { state: { responses } });
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const hasResponse = responses[currentQ.id];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-700 mb-2">Mental Health Assessment</h1>
          <p className="text-gray-600">Question {currentQuestion + 1} of {questions.length}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">
              {currentQ.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQ.type === "radio" ? (
              <RadioGroup
                value={responses[currentQ.id] || ""}
                onValueChange={(value) => handleResponse(currentQ.id, value)}
              >
                {currentQ.options?.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="text-sm leading-relaxed cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <Textarea
                placeholder={currentQ.placeholder}
                value={responses[currentQ.id] || ""}
                onChange={(e) => handleResponse(currentQ.id, e.target.value)}
                className="min-h-[120px]"
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!hasResponse}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
          >
            {currentQuestion === questions.length - 1 ? "View Results" : "Next"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SimpleAssessment;
