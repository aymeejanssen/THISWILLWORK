
import { Card, CardContent } from "@/components/ui/card";
import { Shield, AlertCircle } from "lucide-react";

const Disclaimer = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto border border-gray-200">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <Shield className="h-8 w-8 text-wellness-teal flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                  Important Disclaimer
                </h3>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    <strong>MindEase is not a replacement for professional mental health treatment.</strong> 
                    Our AI companion is designed to provide emotional support, self-reflection tools, and wellness guidance 
                    for everyday stress and life challenges.
                  </p>
                  <p>
                    If you're experiencing thoughts of self-harm, severe depression, anxiety disorders, or other mental health 
                    conditions, please seek help from a licensed mental health professional immediately.
                  </p>
                  <div className="flex items-start gap-3 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <strong className="text-yellow-800">Crisis Resources:</strong>
                      <ul className="mt-2 space-y-1 text-yellow-700">
                        <li>• US: 988 Suicide & Crisis Lifeline</li>
                        <li>• UK: 116 123 Samaritans</li>
                        <li>• International: befrienders.org</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Disclaimer;
