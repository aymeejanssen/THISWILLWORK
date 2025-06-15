
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Heart, Globe, Users, ArrowRight, Sparkles, Shield, Brain, MessageCircle, Star, Mic } from 'lucide-react';
import OnboardingWrapper from "../components/OnboardingWrapper";
import VoiceOnlyChat from '../components/VoiceOnlyChat';

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showVoiceChat, setShowVoiceChat] = useState(false);

  const handleBeginJourney = () => {
    setShowOnboarding(true);
  };

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
  };

  const handleStartVoiceChat = () => {
    setShowVoiceChat(true);
  };

  const handleCloseVoiceChat = () => {
    setShowVoiceChat(false);
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
    <div className="min-h-screen bg-gradient-to-br from-wellness-purple via-wellness-pink to-wellness-yellow">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Floating Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-white text-sm font-medium">The New Generation of Mental Wellness</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-yellow-200 bg-clip-text text-transparent">
              Mynd Ease
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in">
            Your personal AI companion for mental wellness. Get culturally-aware support 
            in your language, available 24/7 for judgment-free guidance and emotional healing.
          </p>

          {/* CTA Buttons - Updated Layout */}
          <div className="flex flex-col items-center gap-6 mb-16 animate-fade-in">
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                onClick={handleBeginJourney}
                size="lg"
                className="bg-white text-wellness-purple hover:bg-white/90 px-12 py-8 text-xl font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 group transform hover:scale-105 border-4 border-white/30"
              >
                Begin My Journey
                <ArrowRight className="ml-3 h-7 w-7 group-hover:translate-x-2 transition-transform" />
              </Button>
              <Button 
                onClick={handleStartVoiceChat}
                size="lg"
                variant="outline"
                className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm px-12 py-8 text-xl font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group transform hover:scale-105 border-2 border-white/50"
              >
                <Mic className="mr-3 h-7 w-7" />
                Live Voice Chat
              </Button>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Shield className="h-5 w-5" />
              <span className="text-base">Private & Secure</span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto mb-20">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-white/80">AI Support</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">50+</div>
              <div className="text-white/80">Languages</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">100%</div>
              <div className="text-white/80">Private</div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="group bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-wellness-purple to-wellness-pink rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Emotional Support</h3>
            <p className="text-gray-600 leading-relaxed">
              Chat with our culturally-aware AI companion that understands your background, 
              language, and emotional needs. Available 24/7 for judgment-free support.
            </p>
          </div>

          <div className="group bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-wellness-pink to-wellness-yellow rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Intelligent Coaching</h3>
            <p className="text-gray-600 leading-relaxed">
              Receive personalized guidance and coping strategies powered by advanced AI. 
              Get practical exercises and insights tailored to your unique situation.
            </p>
          </div>

          <div className="group bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-wellness-purple to-wellness-teal rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Instant Conversations</h3>
            <p className="text-gray-600 leading-relaxed">
              Start meaningful conversations anytime you need support. No appointments, 
              no waiting - your AI wellness companion is always ready to listen and help.
            </p>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-32 mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Stories of Hope & Healing
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Real people sharing how MindEase helped them through their darkest moments
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {reviews.map((review, index) => (
              <div key={index} className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 italic">
                  "{review.review}"
                </p>
                <div className="border-t pt-4">
                  <div className="font-semibold text-gray-900">{review.name}</div>
                  <div className="text-gray-500 text-sm">{review.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-20 text-center">
          <p className="text-white/80 mb-8">Trusted by people from over 50 countries</p>
          <div className="flex justify-center items-center gap-8">
            {countryStats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-4 min-w-[80px]">
                <div className="text-2xl">{stat.flag}</div>
                <div className="text-white font-semibold text-sm">{stat.users}</div>
                <div className="text-white/60 text-xs">{stat.country}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingWrapper onClose={handleCloseOnboarding} />
      )}

      {/* Voice Chat Modal */}
      {showVoiceChat && (
        <VoiceOnlyChat onClose={handleCloseVoiceChat} />
      )}
    </div>
  );
};

export default Index;
