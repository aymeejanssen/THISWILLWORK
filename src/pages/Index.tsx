import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Heart, Globe, Shield, Calendar, Users } from "lucide-react";
import OnboardingFlow from "@/components/OnboardingFlow";
import FeatureCard from "@/components/FeatureCard";
import Disclaimer from "@/components/Disclaimer";
import TherapistSection from "@/components/TherapistSection";

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  const features = [
    {
      icon: MessageCircle,
      title: "24/7 AI Companion",
      description: "Always-available emotional support in your native language",
      color: "bg-wellness-purple"
    },
    {
      icon: Globe,
      title: "Culturally Aware",
      description: "Understands your cultural context and emotional expression",
      color: "bg-wellness-teal"
    },
    {
      icon: Heart,
      title: "Judgment-Free Space",
      description: "Safe environment for processing stress, relationships, and identity",
      color: "bg-wellness-pink"
    },
    {
      icon: Shield,
      title: "Private & Secure",
      description: "Your conversations are encrypted and completely confidential",
      color: "bg-wellness-yellow"
    },
    {
      icon: Calendar,
      title: "Daily Check-ins",
      description: "Optional mood tracking and personalized wellness insights",
      color: "bg-wellness-purple"
    },
    {
      icon: Users,
      title: "Therapist Network",
      description: "Connect with licensed professionals when you're ready",
      color: "bg-wellness-teal"
    }
  ];

  const supportTopics = [
    "Self-love & confidence",
    "Relationship challenges", 
    "Sexual orientation & identity",
    "Work burnout & stress",
    "Anxiety & overthinking",
    "Loneliness & motivation",
    "Cultural identity",
    "Family pressure"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-teal-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 wellness-gradient opacity-10"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-wellness-purple/20 text-wellness-purple border-wellness-purple/30 animate-fade-in">
              🌍 Culturally-aware mental wellness support
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              <span className="wellness-text-gradient">MindEase</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed animate-fade-in">
              Your AI-powered mental wellness companion offering private, judgment-free emotional support 
              in your native language. Feel seen, heard, and supported—anytime, anywhere.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in">
              <Button 
                size="lg" 
                className="bg-wellness-purple hover:bg-wellness-purple/90 text-white px-8 py-6 text-lg"
                onClick={() => setShowOnboarding(true)}
              >
                <Heart className="mr-2 h-5 w-5" />
                Begin Your Journey
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-wellness-teal text-wellness-teal hover:bg-wellness-teal hover:text-white px-8 py-6 text-lg"
              >
                <Users className="mr-2 h-5 w-5" />
                Find a Therapist
              </Button>
            </div>

            {/* Support Topics */}
            <div className="flex flex-wrap justify-center gap-3 mb-16">
              {supportTopics.map((topic, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="bg-white/70 text-gray-700 border border-gray-200 hover:bg-wellness-pink/20 transition-colors"
                >
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 wellness-text-gradient">
              Why Choose MindEase?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Designed for people who need emotional support but don't have access to traditional therapy
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Cultural Awareness Section */}
      <section className="py-20 wellness-gradient-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl font-bold mb-6">
              🌍 Built for Global Mental Wellness
            </h2>
            <p className="text-xl mb-8 opacity-90">
              We understand that emotional expression is deeply cultural. Our AI communicates in your native language 
              and respects your cultural context, making support more personal and meaningful.
            </p>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">50+</div>
                <div className="opacity-90">Languages Supported</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="opacity-90">Always Available</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">100%</div>
                <div className="opacity-90">Judgment-Free</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Therapist Network Section */}
      <TherapistSection />

      {/* Disclaimer Section */}
      <Disclaimer />

      {/* Onboarding Flow Modal */}
      {showOnboarding && (
        <OnboardingFlow onClose={() => setShowOnboarding(false)} />
      )}
    </div>
  );
};

export default Index;
