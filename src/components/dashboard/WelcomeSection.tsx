import React from 'react';

const WelcomeSection: React.FC = () => {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-foreground mb-2">
        안녕하세요! 👋
      </h2>
      <p className="text-muted-foreground">
        공모전 정보를 확인하고 새로운 도전을 시작해보세요.
      </p>
    </div>
  );
};

export default WelcomeSection; 