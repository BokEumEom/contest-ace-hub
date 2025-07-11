import React from 'react';
import TestimonialCard from './TestimonialCard';

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      rating: 5,
      content: "AI 프롬프트 관리 기능이 정말 유용해요. 생성한 이미지와 프롬프트를 한 곳에서 관리할 수 있어서 작업 효율이 크게 향상되었습니다.",
      author: {
        name: "김디자이너",
        role: "디자인 공모전 수상자",
        initial: "김",
        gradient: "bg-gradient-to-r from-blue-500 to-purple-500"
      },
      animationDelay: '0s'
    },
    {
      rating: 5,
      content: "팀 프로젝트에서 일정 관리가 훨씬 쉬워졌어요. 마감일 알림과 진행상황 추적으로 놓치는 일이 없어졌습니다.",
      author: {
        name: "이기획자",
        role: "기획 공모전 참가자",
        initial: "이",
        gradient: "bg-gradient-to-r from-green-500 to-blue-500"
      },
      animationDelay: '0.1s'
    },
    {
      rating: 5,
      content: "파일 관리와 작품 설명 작성이 한 곳에서 가능해서 정말 편리해요. 공모전 준비 과정이 체계적으로 정리됩니다.",
      author: {
        name: "박개발자",
        role: "개발 공모전 참가자",
        initial: "박",
        gradient: "bg-gradient-to-r from-orange-500 to-red-500"
      },
      animationDelay: '0.2s'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in">
            사용자들의 이야기
          </h2>
          <p className="text-xl text-gray-600 animate-slide-up">
            ContestHub로 공모전 준비가 더욱 쉬워졌습니다
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection; 