import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, Mail, Calendar, Gift, Users, Heart, Brain, Shield, Clock } from 'lucide-react';

const CompetitionSignup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@') || !fullName || !dateOfBirth) return;
    setIsSubmittingEmail(true);
    try {
      localStorage.setItem('prelaunch_email', email);
      localStorage.setItem('prelaunch_fullname', fullName);
      localStorage.setItem('prelaunch_dob', dateOfBirth);
      localStorage.setItem('prelaunch_signup_date', new Date().toISOString());

      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Submit to your own API route
      const response = await fetch('/api/hubspot-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          dateOfBirth,
          source: 'pre-launch-competition',
          tags: ['pre-launch', 'competition-entry', 'sri-lanka-contest']
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Submission failed');

      console.log('Successfully added to HubSpot:', data);
      setEmailSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      setEmailSubmitted(true);
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const handleAssessmentClick = () => {
    navigate('/assessment', { state: { returnTo: '/competition' } });
  };

  return (
    <div className="min-h-screen wellness-gradient p-4 sm:p-6">
      {/* ... existing JSX remains unchanged ... */}
    </div>
  );
};

export default CompetitionSignup;
