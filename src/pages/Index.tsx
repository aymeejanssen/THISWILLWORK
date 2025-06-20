
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Brain, Heart, Zap } from "lucide-react";
import SimpleVoiceChat from "../components/SimpleVoiceChat";

const Index = () => {
  const [showVoiceChat, setShowVoiceChat] = useState(false);

  if (showVoiceChat) {
    return <SimpleVoiceChat onClose={() => setShowVoiceChat(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Wellness Coach
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Jouw persoonlijke AI-coach voor mentale gezondheid en welzijn
          </p>
          
          <Button
            onClick={() => setShowVoiceChat(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <Mic className="mr-2 h-5 w-5" />
            Start Spraakgesprek
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <Brain className="h-12 w-12 mx-auto mb-4 text-purple-600" />
              <CardTitle className="text-xl text-purple-700">Intelligente Gesprekken</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Natuurlijke gesprekken met AI die je begrijpt en ondersteunt
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-pink-600" />
              <CardTitle className="text-xl text-pink-700">Empathische Ondersteuning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Warme, begripvolle begeleiding voor je mentale welzijn
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <Zap className="h-12 w-12 mx-auto mb-4 text-cyan-600" />
              <CardTitle className="text-xl text-cyan-700">Directe Respons</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Realtime spraakinteractie voor natuurlijke gesprekken
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How it works */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">Hoe werkt het?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">Spreek</h3>
              <p className="text-sm text-gray-600">Vertel wat je bezighoudt</p>
            </div>
            <div className="text-center">
              <div className="bg-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-pink-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">Luister</h3>
              <p className="text-sm text-gray-600">AI begrijpt je verhaal</p>
            </div>
            <div className="text-center">
              <div className="bg-cyan-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-cyan-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">Begeleiding</h3>
              <p className="text-sm text-gray-600">Krijg persoonlijke tips</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">4</span>
              </div>
              <h3 className="font-semibold mb-2">Groei</h3>
              <p className="text-sm text-gray-600">Verbeter je welzijn</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
