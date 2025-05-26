
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Brain, Heart, Users, Briefcase, Compass, UserCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useAssessment } from '../contexts/AssessmentContext';

const AssessmentSummary = () => {
  const navigate = useNavigate();
  const { responses } = useAssessment();

  // Helper function to analyze patterns based on responses
  const analyzePatterns = () => {
    const patterns = [];
    
    // Family patterns analysis
    if (responses.primaryConcern === 'family') {
      if (responses.familyResponses?.some((r: any) => r.includes('conflict') || r.includes('criticism'))) {
        patterns.push({
          title: "Hypervigilance & People-Pleasing",
          description: "Growing up in a critical or conflict-heavy environment often creates a hypervigilant nervous system. You may find yourself constantly scanning for signs of disapproval, leading to perfectionism and difficulty setting boundaries.",
          insight: "Your sensitivity to others' emotions is actually a superpower - you just need to learn when to turn it on and off.",
          icon: <Users className="h-5 w-5" />,
          severity: "high"
        });
      }
      
      if (responses.familyResponses?.some((r: any) => r.includes('responsible') || r.includes('peace'))) {
        patterns.push({
          title: "Parentification & Over-Responsibility",
          description: "Being responsible for family peace as a child creates adults who feel responsible for everyone's emotions. This shows your incredible capacity for care and empathy.",
          insight: "You learned to be strong for others - now it's time to be gentle with yourself.",
          icon: <Heart className="h-5 w-5" />,
          severity: "medium"
        });
      }
    }

    // Relationship patterns analysis
    if (responses.primaryConcern === 'relationships') {
      if (responses.relationshipResponses?.some((r: any) => r.includes('abandonment') || r.includes('rejection'))) {
        patterns.push({
          title: "Deep Capacity for Love",
          description: "Your fear of abandonment stems from how deeply you love and connect. This isn't a weakness - it's evidence of your profound emotional depth.",
          insight: "Your heart's capacity to love is extraordinary. Learning to love yourself with that same intensity will transform everything.",
          icon: <Heart className="h-5 w-5" />,
          severity: "high"
        });
      }
      
      if (responses.relationshipResponses?.some((r: any) => r.includes('lose yourself') || r.includes('over-give'))) {
        patterns.push({
          title: "Beautiful Generosity",
          description: "Your tendency to over-give shows a heart that naturally wants to nurture and care. This is a gift that just needs some boundaries around it.",
          insight: "Your generosity is beautiful - now let's help you be equally generous with yourself.",
          icon: <Users className="h-5 w-5" />,
          severity: "medium"
        });
      }
    }

    // Self-worth patterns analysis
    if (responses.primaryConcern === 'self-worth') {
      if (responses.selfWorthResponses?.some((r: any) => r.includes('not good enough') || r.includes('perfect'))) {
        patterns.push({
          title: "High Standards & Deep Care",
          description: "Your perfectionism comes from a place of caring deeply about quality and excellence. This drive has likely helped you achieve amazing things.",
          insight: "Your high standards show how much you care. Now let's apply that same excellence to self-compassion.",
          icon: <UserCircle className="h-5 w-5" />,
          severity: "high"
        });
      }
      
      if (responses.selfWorthResponses?.some((r: any) => r.includes('failure') || r.includes('success'))) {
        patterns.push({
          title: "Thoughtful & Reflective Nature",
          description: "Your awareness of both success and failure shows deep self-reflection and emotional intelligence. This insight is actually quite rare and valuable.",
          insight: "Your ability to see nuance in yourself shows remarkable emotional maturity.",
          icon: <Brain className="h-5 w-5" />,
          severity: "medium"
        });
      }
    }

    // Work patterns analysis
    if (responses.primaryConcern === 'work') {
      if (responses.workResponses?.some((r: any) => r.includes('overwhelmed') || r.includes('burned out'))) {
        patterns.push({
          title: "Dedicated & Hardworking",
          description: "Your experience with overwhelm shows how committed you are to doing good work. This dedication is admirable and speaks to your strong work ethic.",
          insight: "Your commitment to excellence is inspiring. Let's channel that energy in a more sustainable way.",
          icon: <Briefcase className="h-5 w-5" />,
          severity: "high"
        });
      }
      
      if (responses.workResponses?.some((r: any) => r.includes('speaking up') || r.includes('judged'))) {
        patterns.push({
          title: "Thoughtful Communicator",
          description: "Your awareness of how you communicate shows emotional intelligence and consideration for others. This mindfulness is a strength.",
          insight: "Your thoughtfulness in communication shows deep empathy - now let's help you advocate for yourself too.",
          icon: <Users className="h-5 w-5" />,
          severity: "medium"
        });
      }
    }

    // Identity patterns analysis
    if (responses.primaryConcern === 'identity') {
      if (responses.identityResponses?.some((r: any) => r.includes('lost') || r.includes('hide'))) {
        patterns.push({
          title: "Rich Inner World",
          description: "Feeling lost sometimes indicates you have a complex, rich inner world with many facets. This depth is actually quite special.",
          insight: "Your complexity isn't confusion - it's depth. Let's help you navigate this beautiful inner landscape.",
          icon: <Compass className="h-5 w-5" />,
          severity: "high"
        });
      }
      
      if (responses.identityResponses?.some((r: any) => r.includes('expectations') || r.includes('accepted'))) {
        patterns.push({
          title: "Adaptable & Considerate",
          description: "Your awareness of others' expectations shows social intelligence and adaptability. These are valuable skills in relationships and work.",
          insight: "Your ability to understand others is remarkable. Now let's help you understand yourself just as clearly.",
          icon: <Brain className="h-5 w-5" />,
          severity: "medium"
        });
      }
    }

    // Loneliness patterns analysis
    if (responses.primaryConcern === 'loneliness') {
      if (responses.lonelinessResponses?.some((r: any) => r.includes('alone') || r.includes('misunderstood'))) {
        patterns.push({
          title: "Deep Emotional Awareness",
          description: "Feeling misunderstood often means you have unique perspectives and deep emotional awareness. This sensitivity is a gift, even when it feels isolating.",
          insight: "Your depth of feeling means you experience life more richly than most. This isn't loneliness - it's depth waiting for the right connections.",
          icon: <Heart className="h-5 w-5" />,
          severity: "high"
        });
      }
      
      if (responses.lonelinessResponses?.some((r: any) => r.includes('burden') || r.includes('vulnerable'))) {
        patterns.push({
          title: "Protective & Self-Aware",
          description: "Your awareness of vulnerability shows emotional intelligence and a protective instinct that has served you well. This self-awareness is actually quite mature.",
          insight: "Your protective instincts show wisdom. Now let's help you feel safe enough to let others care for you too.",
          icon: <Users className="h-5 w-5" />,
          severity: "medium"
        });
      }
    }

    return patterns;
  };

  const patterns = analyzePatterns();
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const generateActionSteps = () => {
    const steps = [];
    
    if (patterns.some(p => p.severity === 'high')) {
      steps.push({
        title: "Start with Self-Compassion",
        description: "Begin each day by speaking to yourself as you would a beloved friend",
        action: "Try this: When you notice self-criticism, pause and ask 'What would I tell a friend in this situation?'"
      });
      
      steps.push({
        title: "Create a Daily Grounding Practice",
        description: "Spend 5-10 minutes daily connecting with your breath and body",
        action: "Start with: 4 deep breaths when you wake up, noticing how your body feels"
      });
    }
    
    if (patterns.some(p => p.title.includes('People-Pleasing') || p.title.includes('Over-Responsibility'))) {
      steps.push({
        title: "Practice Saying No (Gently)",
        description: "Start with small boundaries to build your 'no' muscle",
        action: "This week: Say 'Let me think about it' instead of immediately saying yes to requests"
      });
    }
    
    if (patterns.some(p => p.title.includes('Perfectionism') || p.title.includes('Standards'))) {
      steps.push({
        title: "Celebrate 'Good Enough'",
        description: "Practice recognizing when something is sufficient rather than perfect",
        action: "Daily: Identify one thing you did 'good enough' and celebrate it"
      });
    }
    
    if (patterns.some(p => p.title.includes('Loneliness') || p.title.includes('Connection'))) {
      steps.push({
        title: "Connect with One Person",
        description: "Reach out to someone who makes you feel understood",
        action: "This week: Send a text to someone you trust, sharing one thing you're feeling"
      });
    }
    
    steps.push({
      title: "Journal Your Insights",
      description: "Write down your thoughts and feelings without judgment",
      action: "Tonight: Write for 10 minutes about what you learned about yourself today"
    });
    
    return steps.slice(0, 4); // Limit to 4 steps to not overwhelm
  };

  const personalizedMessage = () => {
    const concernCount = patterns.length;
    if (concernCount === 0) {
      return "Thank you for sharing with us. Every journey to better mental health starts with a single step, and you've already taken that step by being here.";
    }
    
    return `What strikes me most about your responses is the incredible self-awareness and emotional intelligence you demonstrate. You've identified ${concernCount} key area${concernCount > 1 ? 's' : ''} where you'd like to grow, and that level of insight is actually quite remarkable. Many people go through life without this kind of clarity about their inner world.`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 rounded-full px-4 py-2 mb-4">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Assessment Complete</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">You Are Seen and Understood</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {personalizedMessage()}
          </p>
        </div>

        {patterns.length > 0 ? (
          <>
            <Card className="shadow-lg bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">What Your Responses Tell Us About You</h2>
                <p className="text-gray-700 text-center leading-relaxed">
                  Your answers reveal someone with deep emotional intelligence, strong values, and a genuine desire for growth. 
                  Here's what we see in you:
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-6">
              {patterns.map((pattern, index) => (
                <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="flex flex-row items-center space-y-0 space-x-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      {pattern.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl text-gray-900">{pattern.title}</CardTitle>
                      <Badge className={`mt-2 ${getSeverityColor(pattern.severity)}`}>
                        {pattern.severity === 'high' ? 'Core Strength' : 'Beautiful Quality'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-gray-700 leading-relaxed">{pattern.description}</p>
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                      <p className="text-blue-800 italic font-medium">💙 {pattern.insight}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="shadow-lg bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-2xl text-green-800 flex items-center gap-2">
                  <ArrowRight className="h-6 w-6" />
                  Your Personalized Next Steps
                </CardTitle>
                <p className="text-green-700">Small, gentle steps that honor where you are right now</p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {generateActionSteps().map((step, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-400">
                      <h4 className="font-semibold text-gray-900 mb-2">{step.title}</h4>
                      <p className="text-gray-600 mb-2">{step.description}</p>
                      <div className="bg-green-50 p-3 rounded border">
                        <p className="text-green-800 text-sm font-medium">✨ {step.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="pt-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Remember This</h3>
                <p className="text-gray-700 italic text-lg leading-relaxed max-w-2xl mx-auto">
                  "You are not broken and you don't need fixing. You are a human being with a beautiful, complex inner world who deserves love, understanding, and gentle growth. Every step you take toward healing is an act of courage."
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="shadow-lg">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600">
                Thank you for beginning this journey with us. Every path to wellness starts with a single step, 
                and you've already taken that step by being here.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center gap-4">
          <Button onClick={() => navigate('/')} variant="outline" size="lg">
            Take Assessment Again
          </Button>
          <Button onClick={() => navigate('/chat')} className="bg-purple-600 hover:bg-purple-700" size="lg">
            Start Your Healing Journey
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentSummary;
