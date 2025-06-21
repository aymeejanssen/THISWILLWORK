
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Check, Star } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const plans = [
    {
      name: "Weekly",
      price: "$9.99",
      period: "/week",
      description: "Perfect for trying out unlimited conversations",
      features: [
        "Unlimited voice conversations",
        "24/7 AI therapist access",
        "Personalized insights",
        "Progress tracking"
      ],
      buttonText: "Start Free Trial",
      popular: false
    },
    {
      name: "Monthly",
      price: "$29.99",
      period: "/month",
      description: "Our most popular plan for consistent support",
      features: [
        "Everything in Weekly",
        "Advanced analytics",
        "Custom conversation themes",
        "Priority support",
        "Export conversation logs"
      ],
      buttonText: "Choose Monthly",
      popular: true
    },
    {
      name: "Yearly",
      price: "$299.99",
      period: "/year",
      description: "Best value for long-term mental health journey",
      features: [
        "Everything in Monthly",
        "2 months free",
        "Quarterly progress reports",
        "Early access to new features",
        "Personal wellness coach check-ins"
      ],
      buttonText: "Save 17%",
      popular: false
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center relative">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="absolute right-4 top-4"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <CardTitle className="text-3xl font-bold text-purple-700 mb-2">
            Continue Your Mental Health Journey
          </CardTitle>
          <p className="text-gray-600 text-lg">
            Your free 5-minute session is complete. Choose a plan to unlock unlimited conversations with your AI therapist.
          </p>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-xl border-2 p-6 ${
                  plan.popular 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-purple-600">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-gray-800 hover:bg-gray-900'
                  }`}
                  onClick={() => {
                    // Handle subscription logic here
                    console.log(`Selected plan: ${plan.name}`);
                  }}
                >
                  {plan.buttonText}
                </Button>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-4">
              All plans include a 7-day free trial. Cancel anytime.
            </p>
            <div className="flex justify-center gap-4 text-xs text-gray-400">
              <span>🔒 Secure payment</span>
              <span>📱 Works on all devices</span>
              <span>🔄 Cancel anytime</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionModal;
