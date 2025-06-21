
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Heart, Globe, Users, ArrowRight, Sparkles, Shield, Brain, MessageCircle, Star } from 'lucide-react';
import OnboardingWrapper from "../components/OnboardingWrapper";
import OpenAIVoiceChat from "../components/OpenAIVoiceChat";

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showVoiceChat, setShowVoiceChat] = useState(false);

  const handleBeginJourney = () => {
    setShowOnboarding(true);
  };

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
  };

  const reviews = [
    {
      name: "Sarah M.",
      location: "New York, USA",
      review: "I often would feel anxious at night and overthink and cry myself to sleep, feeling completely alone with my worries. MindEase became my lifeline, having someone to talk to at 3 AM when the world felt too heavy changed everything for me.",
      rating: 5
    },
    {
      name: "Ahmed K.",
      location: "Dubai, UAE",
      review: "Yes, very happy with it. Finally found support that understands my background and culture.",
      rating: 5
    },
    {
      name: "Maria L.",
      location: "São Paulo, Brazil",
      review: "After losing my job, I fell into a deep depression. MindEase helped me rebuild my confidence step by step. The 24/7 support meant I never had to face my darkest moments alone.",
      rating: 5
    }
  ];

  const countryStats = [
    { flag: "🇺🇸", users: "34k+", country: "USA" },
    { flag: "🇦🇪", users: "28k+", country: "UAE" },
    { flag: "🇳🇱", users: "25k+", country: "Netherlands" },
    { flag: "🇪🇸", users: "31k+", country: "Spain" }
  ];

  return (
    <div className="min-h-screen wellness-gradient">
      {showVoiceChat && (
        <OpenAIVoiceChat />
      )}
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Floating Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-6 py-3 mb-12 border border-white/30">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-white text-sm font-medium">AI-Powered Mental Wellness</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-8xl font-light text-white mb-8 tracking-tight">
            Welcome to{" "}
            <span className="font-medium bg-gradient-to-r from-white via-purple-200 to-orange-200 bg-clip-text text-transparent">
              Mynd Ease
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 mb-16 max-w-3xl mx-auto leading-relaxed font-light">
            Your personal AI companion for mental wellness. Get culturally-aware support 
            in your language, available 24/7 for judgment-free guidance.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-20">
            <Button 
              onClick={handleBeginJourney}
              size="lg"
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm px-12 py-6 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 text-white/80">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Private & Secure</span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-2xl mx-auto mb-32">
            <div className="text-center">
              <div className="text-4xl font-light text-white mb-2">24/7</div>
              <div className="text-white/80 font-medium">AI Support</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-light text-white mb-2">50+</div>
              <div className="text-white/80 font-medium">Languages</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-light text-white mb-2">100%</div>
              <div className="text-white/80 font-medium">Private</div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-32">
          <div className="group bg-white/10 backdrop-blur-md rounded-3xl p-10 border border-white/20 hover:border-white/40 transition-all duration-300 hover:bg-white/20">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-white/30 transition-colors">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-medium text-white mb-4">Emotional Support</h3>
            <p className="text-white/80 leading-relaxed font-light">
              Chat with our culturally-aware AI companion that understands your background, 
              language, and emotional needs. Available 24/7 for judgment-free support.
            </p>
          </div>

          <div className="group bg-white/10 backdrop-blur-md rounded-3xl p-10 border border-white/20 hover:border-white/40 transition-all duration-300 hover:bg-white/20">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-white/30 transition-colors">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-medium text-white mb-4">Intelligent Coaching</h3>
            <p className="text-white/80 leading-relaxed font-light">
              Receive personalized guidance and coping strategies powered by advanced AI. 
              Get practical exercises and insights tailored to your unique situation.
            </p>
          </div>

          <div className="group bg-white/10 backdrop-blur-md rounded-3xl p-10 border border-white/20 hover:border-white/40 transition-all duration-300 hover:bg-white/20">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-white/30 transition-colors">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-medium text-white mb-4">Instant Conversations</h3>
            <p className="text-white/80 leading-relaxed font-light">
              Start meaningful conversations anytime you need support. No appointments, 
              no waiting - your AI wellness companion is always ready to listen and help.
            </p>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-32">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6 tracking-tight">
              Stories of Hope & Healing
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto font-light">
              Real people sharing how MindEase helped them through their darkest moments
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {reviews.map((review, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:border-white/30 transition-all duration-300 hover:bg-white/20">
                <div className="flex items-center mb-6">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-300 fill-current" />
                  ))}
                </div>
                <p className="text-white/90 leading-relaxed mb-8 font-light italic">
                  "{review.review}"
                </p>
                <div className="border-t border-white/20 pt-6">
                  <div className="font-medium text-white">{review.name}</div>
                  <div className="text-white/60 text-sm font-light">{review.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center">
          <p className="text-white/80 mb-8 font-light">Trusted by people from over 50 countries</p>
          <div className="flex justify-center items-center gap-12">
            {countryStats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-6 min-w-[90px] border border-white/20">
                <div className="text-2xl">{stat.flag}</div>
                <div className="text-white font-medium text-sm">{stat.users}</div>
                <div className="text-white/60 text-xs font-light">{stat.country}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingWrapper onClose={handleCloseOnboarding} />
      )}
    </div>
  );
};

export default Index;
