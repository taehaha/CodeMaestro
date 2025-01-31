import React, { useEffect } from 'react';
import './Contents.css';
import ex from '../../assets/images/ex.png';

function Contents() {
  const features = [
    {
      title: '라이브 코딩 피드백',
      description: '즉각적인 코드 리뷰와 피드백으로 개발 경험을 향상시켜 보세요.',
    },
    {
      title: '프로젝트 관리 기능',
      description: '효율적인 협업을 위해 프로젝트 관리 기능이 추가되었습니다.',
    },
    {
      title: '실시간 채팅',
      description: '팀원과 실시간으로 소통하며 효율적인 협업을 진행하세요.',
    },
  ];

  useEffect(() => {
    const images = document.querySelectorAll('.feature-image');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible'); // 화면에 보이면 클래스 추가
          } else {
            entry.target.classList.remove('visible'); // 화면에서 벗어나면 클래스 제거
          }
        });
      },
      { threshold: 0.3 } // 30% 이상 보일 때 동작
    );

    images.forEach((image) => observer.observe(image));

    return () => {
      images.forEach((image) => observer.unobserve(image));
    };
  }, []);

  return (
    <section className="contents">
      <h2>다양한 기능 소개</h2> <br />
      <p>이제 더욱 강력한 기능을 통해 실시간 협업 학습이 가능합니다!</p>
      <div className="feature-list">
        {features.map((feature, index) => (
          <div
            key={index}
            className={`feature-wrapper ${index % 2 === 0 ? 'left' : 'right'}`}
          >
            <img src={ex} alt={`${feature.title} 이미지`} className="feature-image" />
            <div className="feature-item">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Contents;
