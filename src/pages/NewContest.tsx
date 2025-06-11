
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ContestForm from '@/components/ContestForm';
import { Contest } from '@/types/contest';

const NewContest = () => {
  const navigate = useNavigate();

  const handleSuccess = (contest: Contest) => {
    navigate(`/contest/${contest.id}`);
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            새 공모전 등록
          </h2>
          <p className="text-muted-foreground">
            참여하고 싶은 공모전을 등록하고 체계적으로 관리해보세요.
          </p>
        </div>

        <ContestForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </main>
    </div>
  );
};

export default NewContest;
