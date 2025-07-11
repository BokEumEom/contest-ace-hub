import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  iconBgColor: string;
  iconColor: string;
  animationDelay?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  features,
  iconBgColor,
  iconColor,
  animationDelay = '0s'
}) => {
  return (
    <Card className="feature-card border-0 shadow-lg hover:shadow-xl transition-shadow animate-scale-in" style={{ animationDelay }}>
      <CardHeader className="text-center">
        <div className={`mx-auto w-16 h-16 ${iconBgColor} rounded-full flex items-center justify-center mb-4 feature-icon`}>
          <Icon className={`h-8 w-8 ${iconColor}`} />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-gray-600">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default FeatureCard; 