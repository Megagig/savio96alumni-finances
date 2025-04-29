import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
}

const Logo: React.FC<LogoProps> = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'h-6 text-xl',
    medium: 'h-8 text-2xl',
    large: 'h-12 text-3xl'
  };

  return (
    <div className="flex items-center">
      <div className={`text-primary-600 font-bold ${sizeClasses[size]}`}>
        Financial Hub
      </div>
    </div>
  );
};

export default Logo;
