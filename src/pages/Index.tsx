import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Heart, Globe, Users, ArrowRight, Sparkles, Shield, Brain, MessageCircle, Star } from 'lucide-react';
import OnboardingWrapper from "../components/OnboardingWrapper";
import { RealtimeAgent, RealtimeSession } from '@openai/agents-realtime';

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showVoiceChat, setShowVoiceChat] = useState(false);

  const handleBeginJourney = () => {
    setShowOnboarding(true);
  };

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
  };

 const startRealtimeSession = async () => {
  try {
    const agent = new RealtimeAgent({
      name: 'Assistant',
      instructions: 'You provide mental health assistance, companionship, psychological insights and good advice.',
    });

    const session = new RealtimeSession(agent);

    // 🔑 Call your /api/session route to get the ephemeral key from Vercel
    const res = await fetch('/api/session');
    const data = await res.json();
    const ephemeralKey = data.client_secret?.value;

    if (!ephemeralKey) throw new Error("Missing ephemeral key");

    // ✅ Connect to the Realtime API with your key
    await session.connect({ apiKey: ephemeralKey });
    console.log("✅ Connected to Realtime API");

    // 🎤 Get mic permission and pass stream
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    (await (session as any).audio.input.start(stream));
    console.log("🎤 Microphone started");

  } catch (error) {
    console.error("Realtime session error:", error);
  }
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
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Floating Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-6 py-3 mb-12 border border-white/30">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-white text-sm font-medium">AI-Powered Mental Wellness</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-8xl text-white mb-8 tracking-tight font-medium">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-white via-purple-200 to-orange-200 bg-clip-text text-transparent font-semibold">
              Mynd.Ease
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 mb-16 max-w-3xl mx-auto leading-relaxed font-light">
            Your personal AI companion for mental wellness. Get culturally-aware support 
            in your language, available 24/7 for judgment-free guidance.
          </p>

         {/* CTA Buttons */}
<div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-20">
  <Button
    onClick={handleBeginJourney}
    size="lg"
    className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm px-12 py-6 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
  >
    Get Started
    <ArrowRight className="ml-3 h-5 w-5" />
  </Button>

  <div className="flex items-center gap-2 text-white/80 mt-4 sm:mt-0">
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

        {/* Onboarding Modal */}
        {showOnboarding && <OnboardingWrapper onClose={handleCloseOnboarding} />}
      </div>
    </div>
  );
};

export default Index;


