import React from 'react';
import { MonitorPlay } from 'lucide-react';

interface AppLogoProps {
  className?: string;
  size?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = 'w-6 h-6', size }) => {
  return <MonitorPlay className={className} size={size} />;
};

