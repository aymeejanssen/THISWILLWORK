
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Heart, Sparkles } from 'lucide-react';

const AssessmentComplete = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen wellness-gradient p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Heart className="h-8 w-8 text-white" />
          </div>
          
          <Badge className="bg-white text-gray-900 px-4 py-2 text-lg font-semibold">
            Launching July 1st, 2025
          </Badge>
          
          <h1 className="text-3xl font-bold text-white">
            Thank You for Sharing Your Journey
          </h1>
          
          <p className="text-xl text-white/90">
            We're deeply grateful that you trusted us with your experiences and feelings.
          </p>
        </div>

        <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="h-6 w-6 text-white" />
              <h2 className="text-xl font-semibold text-white">What's Next?</h2>
            </div>
            
            <div className="space-y-4 text-white/90">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                <p>Your responses help us understand how to better support people like you when we launch.</p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                <p>We'll send you personalized insights and early access when our AI wellness coach goes live on July 1st, 2025.</p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                <p>If you signed up for our contest, you're automatically entered to win the wellness retreat in Sri Lanka!</p>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-lg border border-white/10 backdrop-blur-sm">
              <p className="text-white/80 text-sm">
                💝 Your vulnerability and honesty in sharing your experiences means everything to us. 
                Healing journeys take courage, and you've already taken an important step.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center space-x-4">
          <Button 
            onClick={() => navigate('/competition')} 
            variant="outline" 
            className="border-white/30 text-white hover:bg-white/20"
          >
            Back to Contest
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentComplete;
