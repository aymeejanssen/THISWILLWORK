import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Star, MapPin, Clock, Languages } from "lucide-react";

const TherapistSection = () => {
  const therapists = [
    {
      name: "Dr. Sarah Ahmed",
      specialties: ["Cultural Identity", "Anxiety", "Identity Support"],
      languages: ["English", "Arabic"],
      location: "Online",
      rating: 4.9,
      price: "$75/session"
    },
    {
      name: "Dr. Maria Rodriguez",
      specialties: ["Relationship Issues", "Depression", "Work Stress"],
      languages: ["English", "Spanish"],
      location: "Online",
      rating: 4.8,
      price: "$80/session"
    },
    {
      name: "Dr. Priya Sharma",
      specialties: ["Family Pressure", "Self-esteem", "Cultural Transition"],
      languages: ["English", "Hindi", "Urdu"],
      location: "Online",
      rating: 4.9,
      price: "$70/session"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 wellness-text-gradient">
            Ready for Human Support?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            When you're ready to take the next step, connect with our network of licensed, 
            culturally-aware therapists who understand your background and language.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {therapists.map((therapist, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow border-0 bg-gray-50/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">{therapist.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">{therapist.rating}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {therapist.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Languages className="h-4 w-4" />
                    {therapist.languages.join(", ")}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    {therapist.price}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {therapist.specialties.map((specialty, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>

                <Button className="w-full bg-wellness-teal hover:bg-wellness-teal/90">
                  <Users className="mr-2 h-4 w-4" />
                  View Profile
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" variant="outline" className="border-wellness-purple text-wellness-purple hover:bg-wellness-purple hover:text-white">
            Browse All Therapists
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TherapistSection;
