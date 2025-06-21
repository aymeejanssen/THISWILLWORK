
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Brain, Heart, Users } from "lucide-react";
import FeatureCard from "@/components/FeatureCard";
import TherapistSection from "@/components/TherapistSection";
import OnboardingWrapper from "@/components/OnboardingWrapper";
import { useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    console.log('Onboarding closed');
  };

  const handleStartAssessment = () => {
    setShowOnboarding(true);
  };

  return (
    <>
      {showOnboarding && (
        <OnboardingWrapper onClose={handleCloseOnboarding} />
      )}
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
              Welcome to Your Wellness Journey
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover personalized insights, connect with mental health professionals, 
              and take the first step towards better mental wellness.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleStartAssessment}
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
              >
                Take Assessment
              </Button>
              
              <Button 
                onClick={() => navigate("/conversation")}
                size="lg"
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Start AI Conversation
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <FeatureCard
              icon={Brain}
              title="AI-Powered Insights"
              description="Get personalized recommendations based on your unique mental health profile."
            />
            <FeatureCard
              icon={Heart}
              title="Holistic Wellness"
              description="Address all aspects of your mental health with comprehensive assessments."
            />
            <FeatureCard
              icon={Users}
              title="Professional Support"
              description="Connect with qualified therapists and mental health professionals."
            />
          </div>

          {/* How it Works */}
          <Card className="max-w-4xl mx-auto mb-16">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-gray-800">
                How It Works
              </CardTitle>
              <CardDescription className="text-lg">
                Your journey to better mental health in three simple steps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-purple-600">1</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Take Assessment</h3>
                  <p className="text-gray-600">
                    Complete our comprehensive mental health questionnaire
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-pink-600">2</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Get Insights</h3>
                  <p className="text-gray-600">
                    Receive personalized analysis and recommendations
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-teal-600">3</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Take Action</h3>
                  <p className="text-gray-600">
                    Connect with professionals and start your wellness journey
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <TherapistSection />
        </div>
      </div>
    </>
  );
};

export default Index;
