
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Heart, Globe, Users, ArrowRight, Sparkles, Shield } from 'lucide-react';
import OnboardingWrapper from "../components/OnboardingWrapper";

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleBeginJourney = () => {
    setShowOnboarding(true);
  };

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-wellness-purple via-wellness-pink to-wellness-yellow">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Floating Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-white text-sm font-medium">AI-Powered Mental Wellness</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-yellow-200 bg-clip-text text-transparent">
              MindEase
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in">
            Your personal AI companion for mental wellness. Get culturally-aware support 
            in your language, connect with verified therapists, and start your journey to better mental health.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in">
            <Button 
              onClick={handleBeginJourney}
              size="lg"
              className="bg-white text-wellness-purple hover:bg-white/90 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              Begin My Journey
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <div className="flex items-center gap-2 text-white/80">
              <Shield className="h-4 w-4" />
              <span className="text-sm">Private & Secure</span>
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
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Verified Therapists</h3>
            <p className="text-gray-600 leading-relaxed">
              Connect with licensed mental health professionals who understand your 
              cultural context. Browse profiles, read reviews, and book sessions.
            </p>
          </div>

          <div className="group bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-wellness-purple to-wellness-teal rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Globe className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Global & Cultural</h3>
            <p className="text-gray-600 leading-relaxed">
              Get support in your native language with cultural sensitivity. Our platform 
              understands diverse backgrounds and provides relevant, respectful guidance.
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-20 text-center">
          <p className="text-white/80 mb-8">Trusted by people from over 50 countries</p>
          <div className="flex justify-center items-center gap-8 opacity-60">
            <div className="w-12 h-12 bg-white/20 rounded-lg"></div>
            <div className="w-12 h-12 bg-white/20 rounded-lg"></div>
            <div className="w-12 h-12 bg-white/20 rounded-lg"></div>
            <div className="w-12 h-12 bg-white/20 rounded-lg"></div>
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
