
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Brain, Heart, Users, Briefcase, Compass, UserCircle } from 'lucide-react';

interface AssessmentSummaryProps {
  responses: Record<string, any>;
}

const AssessmentSummary = ({ responses }: AssessmentSummaryProps) => {
  const navigate = useNavigate();

  // Helper function to analyze patterns based on responses
  const analyzePatterns = () => {
    const patterns = [];
    
    // Family patterns analysis
    if (responses.primaryConcern === 'family') {
      if (responses.familyResponses?.some((r: any) => r.includes('conflict') || r.includes('criticism'))) {
        patterns.push({
          title: "Hypervigilance & People-Pleasing",
          description: "Growing up in a critical or conflict-heavy environment often creates a hypervigilant nervous system. You may find yourself constantly scanning for signs of disapproval, leading to perfectionism and difficulty setting boundaries in relationships and work.",
          icon: <Users className="h-5 w-5" />,
          severity: "high"
        });
      }
      
      if (responses.familyResponses?.some((r: any) => r.includes('responsible') || r.includes('peace'))) {
        patterns.push({
          title: "Parentification & Over-Responsibility",
          description: "Being responsible for family peace as a child creates adults who feel responsible for everyone's emotions. This can manifest as burnout, difficulty receiving help, and choosing relationships where you're the caretaker.",
          icon: <Heart className="h-5 w-5" />,
          severity: "medium"
        });
      }
    }

    // Relationship patterns analysis
    if (responses.primaryConcern === 'relationships') {
      if (responses.relationshipResponses?.some((r: any) => r.includes('abandonment') || r.includes('rejection'))) {
        patterns.push({
          title: "Attachment Insecurity",
          description: "Fear of abandonment often stems from inconsistent caregiving in childhood. This creates a push-pull dynamic in relationships - craving closeness while simultaneously fearing it, leading to self-sabotage or choosing unavailable partners.",
          icon: <Heart className="h-5 w-5" />,
          severity: "high"
        });
      }
      
      if (responses.relationshipResponses?.some((r: any) => r.includes('lose yourself') || r.includes('over-give'))) {
        patterns.push({
          title: "Codependent Patterns",
          description: "Over-giving and losing yourself in relationships often develops when love felt conditional in childhood. You learned that your worth comes from what you provide others, creating exhausting relationship dynamics.",
          icon: <Users className="h-5 w-5" />,
          severity: "medium"
        });
      }
    }

    // Self-worth patterns analysis
    if (responses.primaryConcern === 'self-worth') {
      if (responses.selfWorthResponses?.some((r: any) => r.includes('not good enough') || r.includes('perfect'))) {
        patterns.push({
          title: "Core Shame & Perfectionism",
          description: "Feeling 'not good enough' despite achievements suggests core shame - a deep belief that you're fundamentally flawed. This drives perfectionism as a protection mechanism, but creates chronic anxiety and prevents authentic connections.",
          icon: <UserCircle className="h-5 w-5" />,
          severity: "high"
        });
      }
      
      if (responses.selfWorthResponses?.some((r: any) => r.includes('failure') || r.includes('success'))) {
        patterns.push({
          title: "Success/Failure Anxiety",
          description: "Fear of both failure AND success often indicates imposter syndrome and a fragmented sense of self. Success feels dangerous because it might expose you as a 'fraud,' while failure confirms your worst fears about yourself.",
          icon: <Brain className="h-5 w-5" />,
          severity: "medium"
        });
      }
    }

    // Work patterns analysis
    if (responses.primaryConcern === 'work') {
      if (responses.workResponses?.some((r: any) => r.includes('overwhelmed') || r.includes('burned out'))) {
        patterns.push({
          title: "Achievement-Based Worth",
          description: "Chronic overwork and burnout often stem from learning that love and acceptance were tied to performance. Your nervous system remains in 'prove yourself' mode, making rest feel dangerous and productivity feel like survival.",
          icon: <Briefcase className="h-5 w-5" />,
          severity: "high"
        });
      }
      
      if (responses.workResponses?.some((r: any) => r.includes('speaking up') || r.includes('judged'))) {
        patterns.push({
          title: "Authority & Visibility Issues",
          description: "Difficulty with authority or being seen often traces to childhood experiences with criticism or invalidation. Your system learned that visibility equals danger, creating career limitations and difficulty advocating for yourself.",
          icon: <Users className="h-5 w-5" />,
          severity: "medium"
        });
      }
    }

    // Identity patterns analysis
    if (responses.primaryConcern === 'identity') {
      if (responses.identityResponses?.some((r: any) => r.includes('lost') || r.includes('hide'))) {
        patterns.push({
          title: "Fragmented Identity",
          description: "Feeling lost or needing to hide your true self suggests you learned early that authenticity wasn't safe. This creates multiple 'selves' for different situations, leading to exhaustion and a sense of not knowing who you really are.",
          icon: <Compass className="h-5 w-5" />,
          severity: "high"
        });
      }
      
      if (responses.identityResponses?.some((r: any) => r.includes('expectations') || r.includes('accepted'))) {
        patterns.push({
          title: "External Validation Dependency",
          description: "Living by others' expectations rather than your own values creates a life that feels hollow and inauthentic. This pattern often develops when early caregivers loved the 'idea' of you rather than accepting who you actually were.",
          icon: <Brain className="h-5 w-5" />,
          severity: "medium"
        });
      }
    }

    // Loneliness patterns analysis
    if (responses.primaryConcern === 'loneliness') {
      if (responses.lonelinessResponses?.some((r: any) => r.includes('alone') || r.includes('misunderstood'))) {
        patterns.push({
          title: "Emotional Isolation",
          description: "Feeling alone even around people suggests a deep disconnection from your authentic self and others. This often develops when emotional needs weren't met in childhood, creating a protective wall that now feels impossible to break down.",
          icon: <Heart className="h-5 w-5" />,
          severity: "high"
        });
      }
      
      if (responses.lonelinessResponses?.some((r: any) => r.includes('burden') || r.includes('vulnerable'))) {
        patterns.push({
          title: "Vulnerability Avoidance",
          description: "Fearing you're a burden or avoiding vulnerability typically stems from early experiences where your needs were dismissed or punished. This creates a lonely cycle where you need connection but can't risk the openness required to create it.",
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
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const generateRecommendations = () => {
    const recs = [];
    
    if (patterns.some(p => p.severity === 'high')) {
      recs.push("Consider working with a trauma-informed therapist who understands attachment and nervous system healing");
      recs.push("Explore somatic therapies (EMDR, Somatic Experiencing) to address stored trauma in the body");
    }
    
    if (patterns.some(p => p.title.includes('Perfectionism') || p.title.includes('Achievement'))) {
      recs.push("Practice self-compassion exercises and challenge your inner critic");
      recs.push("Set boundaries around work and practice saying no without over-explaining");
    }
    
    if (patterns.some(p => p.title.includes('Attachment') || p.title.includes('Isolation'))) {
      recs.push("Consider attachment-focused therapy to understand your relationship patterns");
      recs.push("Practice gradual vulnerability with trusted friends or support groups");
    }
    
    recs.push("Develop a daily mindfulness or grounding practice to regulate your nervous system");
    recs.push("Journal about your childhood experiences and current patterns without judgment");
    
    return recs;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Your Psychological Assessment Summary</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Based on your responses, here are the key patterns we've identified and how they may be impacting your life today.
          </p>
        </div>

        {patterns.length > 0 ? (
          <>
            <div className="grid gap-6">
              {patterns.map((pattern, index) => (
                <Card key={index} className="shadow-lg">
                  <CardHeader className="flex flex-row items-center space-y-0 space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {pattern.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{pattern.title}</CardTitle>
                      <Badge className={`mt-2 ${getSeverityColor(pattern.severity)}`}>
                        {pattern.severity === 'high' ? 'High Priority' : 'Medium Priority'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{pattern.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="shadow-lg bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-xl text-green-800 flex items-center gap-2">
                  <Compass className="h-5 w-5" />
                  Recommended Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {generateRecommendations().map((rec, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-green-800">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-lg bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <p className="text-blue-800 text-center italic">
                  "Healing happens in relationship - with yourself, with others, and with life itself. 
                  These patterns developed as brilliant adaptations to difficult circumstances. 
                  Now they can be gently transformed as you create the safety you never had."
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="shadow-lg">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600">
                We need more information to provide a comprehensive analysis. 
                Please complete the assessment questions.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center gap-4">
          <Button onClick={() => navigate('/')} variant="outline">
            Retake Assessment
          </Button>
          <Button onClick={() => navigate('/chat')} className="bg-blue-600 hover:bg-blue-700">
            Start Healing Journey
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentSummary;
