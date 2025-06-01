
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const PrivacyPolicy = () => {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Privacy Policy</CardTitle>
        <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-semibold text-lg mb-2">1. Information We Collect</h3>
              <p className="mb-2">We collect the following types of sensitive personal data:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Mental health assessment responses and concerns</li>
                <li>Voice conversations with AI wellness coach</li>
                <li>Personal struggles and emotional state information</li>
                <li>Usage patterns and interaction data</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">2. How We Use Your Data</h3>
              <p className="mb-2">Your sensitive data is used exclusively for:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Providing personalized AI wellness coaching</li>
                <li>Generating mental health insights and recommendations</li>
                <li>Improving our AI coaching algorithms</li>
                <li>Ensuring service quality and safety</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">3. Data Security</h3>
              <p>We implement industry-standard encryption and security measures to protect your sensitive mental health data. All data is encrypted in transit and at rest.</p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">4. Your Rights</h3>
              <p className="mb-2">Under GDPR, you have the right to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Access your personal data</li>
                <li>Rectify inaccurate data</li>
                <li>Erase your data ("right to be forgotten")</li>
                <li>Restrict processing of your data</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">5. Data Retention</h3>
              <p>We retain your data only as long as necessary to provide our services or as required by law. You can request deletion at any time.</p>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-2">6. Contact</h3>
              <p>For privacy concerns or data requests, contact us at privacy@mynde.ase</p>
            </section>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PrivacyPolicy;
