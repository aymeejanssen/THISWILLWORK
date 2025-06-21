import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from 'lucide-react';
import VoiceOnlyChat from "@/components/VoiceOnlyChat";

interface AssessmentResult {
  category: string;
  score: number;
  maxScore: number;
}

const AssessmentSummary = () => {
  const [showVoiceChat, setShowVoiceChat] = useState(false);

  const assessmentResults: AssessmentResult[] = [
    { category: "Mood", score: 8, maxScore: 10 },
    { category: "Anxiety", score: 6, maxScore: 10 },
    { category: "Stress", score: 7, maxScore: 10 },
  ];

  const toggleVoiceChat = () => {
    setShowVoiceChat(!showVoiceChat);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-purple-700">
            Assessment Summary
          </CardTitle>
          <p className="text-sm text-gray-600">
            Review your assessment results and discuss with our AI.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {assessmentResults.map((result, index) => (
            <div key={index} className="flex items-center justify-between">
              <span>{result.category}</span>
              <span>
                {result.score} / {result.maxScore}
              </span>
              {result.score > result.maxScore / 2 ? (
                <CheckCircle className="text-green-500 h-5 w-5" />
              ) : (
                <XCircle className="text-red-500 h-5 w-5" />
              )}
            </div>
          ))}
          <Button onClick={toggleVoiceChat} className="w-full bg-purple-500 text-white">
            {showVoiceChat ? "Hide Voice Chat" : "Show Voice Chat"}
          </Button>
        </CardContent>
      </Card>
      
      {showVoiceChat && (
        <VoiceOnlyChat />
      )}
    </div>
  );
};

export default AssessmentSummary;
