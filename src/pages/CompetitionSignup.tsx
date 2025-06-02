
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, Mail, Calendar, Gift, Users } from 'lucide-react';

const CompetitionSignup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setIsSubmittingEmail(true);
    try {
      localStorage.setItem('prelaunch_email', email);
      localStorage.setItem('prelaunch_signup_date', new Date().toISOString());
      console.log('Pre-launch email captured:', email);
      setEmailSubmitted(true);
    } catch (err) {
      console.error('Error storing email:', err);
    } finally {
      setIsSubmittingEmail(false);
    }
  };
  return <div className="min-h-screen wellness-gradient p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <Badge className="bg-purple-500/80 text-white border-purple-300/50 px-6 py-3 text-xl font-bold backdrop-blur-sm">
            Launching July 1st, 2025
          </Badge>
          
          <div className="space-y-1">
            <h1 className="text-4xl font-bold">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                Mynd Ease
              </span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Personalized AI wellness coach to help you heal from trauma, build resilience, and improve your mental wellness.
            </p>
          </div>
        </div>

        {/* Contest Badge - Moved above email signup */}
        <div className="text-center">
          <Badge className="bg-purple-500/20 text-white px-4 py-2 text-lg font-semibold border border-purple-300/30 backdrop-blur-sm">
            🏆 Win a Mental Wellness Retreat in Sri Lanka
          </Badge>
        </div>

        {/* Email Signup Section with Side Elements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
          {/* Left Side - Benefits */}
          <div className="hidden lg:block space-y-4">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
              <div className="flex items-center gap-3 text-white">
                <Calendar className="h-6 w-6 text-yellow-300" />
                <div>
                  <h3 className="font-semibold">Early Access</h3>
                  <p className="text-sm text-white/80">First to try July 1st</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
              <div className="flex items-center gap-3 text-white">
                <Gift className="h-6 w-6 text-pink-300" />
                <div>
                  <h3 className="font-semibold">Free Trial</h3>
                  <p className="text-sm text-white/80">No cost to start</p>
                </div>
              </div>
            </div>
          </div>

          {/* Center - Main Signup Form */}
          <div>
            {!emailSubmitted ? <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
                <CardHeader className="text-center pb-1 px-[5px] pt-3">
                  <CardTitle className="text-white text-2xl">Join Mynd Ease Pre-Launch</CardTitle>
                  <p className="text-white/90">Get early access & a chance to win a trip to Sri Lanka</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleEmailSubmit} className="space-y-2">
                    <div className="text-left">
                      <Label htmlFor="email" className="text-sm font-medium text-white">
                        Email Address
                      </Label>
                      <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 bg-white/10 border-white/30 text-white placeholder:text-white/60 backdrop-blur-sm" />
                    </div>
                    <Button type="submit" disabled={!email || !email.includes('@') || isSubmittingEmail} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600">
                      {isSubmittingEmail ? <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Signing Up...
                        </> : <>
                          <Mail className="h-4 w-4 mr-2" />
                          Join Pre-Launch List & Chance to Win Trip
                        </>}
                    </Button>
                  </form>
                  
                  <div className="text-sm text-white/80 text-center">
                    <div className="flex items-center justify-center gap-2 flex-wrap leading-tight">
                      <span>✓ Free trial when we launch</span>
                      <span>✓ First access July 1st</span>
                      <span>✓ Automatic contest entry below 👇</span>
                    </div>
                  </div>
                </CardContent>
              </Card> : <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
                <CardContent className="p-6 text-center space-y-4">
                  <CheckCircle className="h-8 w-8 text-white mx-auto" />
                  <h3 className="text-xl font-bold text-white">You're All Set!</h3>
                  <p className="text-white/90">
                    Thank you for joining our pre-launch list! We'll notify you at <strong>{email}</strong> when Mynd Ease launches July 1st.
                  </p>
                  <p className="text-sm text-white font-medium">
                    🏆 Contest entry confirmed! Scroll down to see contest details.
                  </p>
                </CardContent>
              </Card>}
          </div>

          {/* Right Side - Contest Highlight */}
          <div className="hidden lg:block space-y-4">
            <div className="bg-purple-500/20 backdrop-blur-sm p-4 rounded-lg border border-purple-300/30">
              <div className="flex items-center gap-3 text-white">
                <Gift className="h-6 w-6 text-purple-300" />
                <div>
                  <h3 className="font-semibold">Win Sri Lanka Trip</h3>
                  <p className="text-sm text-white/80">6-day wellness retreat</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
              <div className="flex items-center gap-3 text-white">
                <Users className="h-6 w-6 text-green-300" />
                <div>
                  <h3 className="font-semibold">Join Community</h3>
                  <p className="text-sm text-white/80">Connect with others</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contest Section - Vertical Layout */}
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center space-y-6">
            {/* Contest Details Box with Image - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              {/* Contest Details - Left Side */}
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20 space-y-4">
                <h3 className="text-lg font-semibold text-white">6-Day All-Expenses-Paid Wellness Journey Includes:</h3>
                <div className="space-y-3">
                  {/* First Row */}
                  <div className="grid grid-cols-2 gap-2 text-white/90 text-sm">
                    <p className="text-left">✈️ Round-trip flights covered</p>
                    <p className="text-left">🏔️ 5 nights in scenic Ella mountains</p>
                    <p className="text-left">🧘‍♀️ Daily yoga & meditation sessions</p>
                    <p className="text-left">❤️‍🩹 Guided therapy & wellness coaching</p>
                  </div>
                  {/* Second Row */}
                  <div className="grid grid-cols-2 gap-2 text-white/90 text-sm">
                    <p className="text-left">💆‍♀️ Daily massages included</p>
                    <p className="text-left">📱 Complete digital detox program</p>
                    <p className="text-left">🌿 Mindfulness & nature immersion</p>
                    <p className="text-left">🥗 Healthy organic meals included</p>
                  </div>
                </div>
              </div>
              
              {/* Image - Right Side */}
              <div className="rounded-lg overflow-hidden shadow-2xl">
                <img src="/lovable-uploads/1749b98f-d6c9-41a9-977f-47b9be29154e.png" alt="Sri Lanka mountain railway through lush green forest - your wellness retreat destination" className="w-full h-64 lg:h-80 object-cover" />
              </div>
            </div>
          </div>
        </div>

        {/* Assessment Button */}
        <div className="text-center">
          <Button onClick={() => navigate('/assessment')} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 px-8 py-4 text-lg rounded-lg">
            Take 12 Questions to Resolve Trauma & Get Insights
          </Button>
          <p className="text-white/80 text-sm mt-2">
            Help us understand your wellness journey • 5 minutes
          </p>
        </div>
      </div>
    </div>;
};

export default CompetitionSignup;
