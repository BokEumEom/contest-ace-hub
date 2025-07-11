import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface TestimonialCardProps {
  rating: number;
  content: string;
  author: {
    name: string;
    role: string;
    initial: string;
    gradient: string;
  };
  animationDelay?: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  rating,
  content,
  author,
  animationDelay = '0s'
}) => {
  return (
    <Card className="testimonial-card border-0 shadow-lg bg-white animate-scale-in" style={{ animationDelay }}>
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
          ))}
        </div>
        <p className="text-gray-600 mb-4">{content}</p>
        <div className="flex items-center">
          <div className={`w-10 h-10 ${author.gradient} rounded-full flex items-center justify-center text-white font-semibold`}>
            {author.initial}
          </div>
          <div className="ml-3">
            <p className="font-semibold text-gray-900">{author.name}</p>
            <p className="text-sm text-gray-500">{author.role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard; 