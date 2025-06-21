
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <Card className="text-center hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="mb-4 flex justify-center">
          <Icon className="h-8 w-8 text-purple-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
