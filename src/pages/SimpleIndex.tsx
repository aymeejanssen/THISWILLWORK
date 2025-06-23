
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { Brain, Heart, Shield, Clock, Users, CheckCircle } from 'lucide-react';

const SimpleIndex = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Get personalized insights based on your responses"
    },
    {
      icon: Heart,
      title: "Mental Health Focus",
      description: "Designed specifically for mental wellness assessment"
    },
    {
      icon: Shield,
      title: "Private & Secure",
      description: "Your data stays private and secure"
    },
    {
      icon: Clock,
      title: "Quick Assessment",
      description: "Complete in just 10-15 minutes"
    }
  ];

  const benefits = [
    "Understand your mental health patterns",
    "Get personalized recommendations",
    "Track your wellness journey",
    "Evidence-based insights"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold text-purple-700">MindWell</span>
            </div>
            <Button 
              onClick={() => navigate('/simple-assessment')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Start Assessment
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-purple-100 text-purple-800 hover:bg-purple-100">
            Free Mental Health Assessment
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Understand Your
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Mental Health</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get personalized insights about your mental wellness through our comprehensive assessment tool. 
            Discover patterns, understand your needs, and receive tailored recommendations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/simple-assessment')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg"
            >
              Take Free Assessment
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-purple-200 text-purple-700 hover:bg-purple-50 px-8 py-4 text-lg"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Assessment?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our evidence-based assessment provides meaningful insights to help you understand and improve your mental wellness.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <feature.icon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Discover Your Path to Better Mental Health
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our comprehensive assessment helps you gain deeper insights into your mental wellness patterns and provides personalized recommendations for your journey.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Card className="border-0 shadow-2xl">
              <CardHeader className="text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <CardTitle className="text-2xl">Ready to Begin?</CardTitle>
              </CardHeader>
              <CardContent className="p-8 text-center">
                <Users className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                <p className="text-gray-600 mb-6">
                  Join thousands who have gained valuable insights about their mental health through our assessment.
                </p>
                <Button 
                  size="lg" 
                  onClick={() => navigate('/simple-assessment')}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Start Your Assessment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="h-6 w-6" />
            <span className="text-xl font-bold">MindWell</span>
          </div>
          <p className="text-gray-400 mb-6">
            Your journey to better mental health starts here.
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SimpleIndex;
