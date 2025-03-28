import React, { useEffect } from 'react';
import './Contents.css';
import ex2 from '../../assets/images/ex2.gif';
import video from '../../assets/video-conference.png'
import edit from '../../assets/edit.gif'
import paint from '../../assets/paint.gif'
import ai from '../../assets/ai.png'

function Contents() {
  const features = [
    {
      title: '온라인 화상 스터디',
      description: '팀원들과 실시간으로 소통하며 효율적인 스터디를 진행하세요.',
      image: video,
    },
    {
      title: '코드 동시 편집 툴',
      description: '실시간 코드 리뷰와 피드백으로 실력을 향상시켜 보세요.',
      image: edit,
    },
    {
      title: '그림판 동시 편집 툴',
      description: '코드만으로 설명하기 어려운 개념을 직관적으로 표현하고 소통할 수 있습니다.',
      image: paint,
    },
    {
      title: 'AI 코드 리뷰',
      description: 'AI 용기쌤의 수준별 맞춤형 도움을 받아보세요!',
      image: ai,
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
      <p>이제 더욱 강력한 기능을 통해 온라인 학습이 가능합니다!</p>
      <div className="feature-list">
        {features.map((feature, index) => (
          <div
            key={index}
            className={`feature-wrapper ${index % 2 === 0 ? 'left' : 'right'}`}
          >
            <div className="feature-image-box">
            {feature.image ? (
              <img src={feature.image} alt={`${feature.title} 이미지`} className="feature-image" />
            ) : (
          <video autoPlay loop muted className="feature-video">
            <source src={feature.video} type="video/mp4" />
            브라우저가 비디오를 지원하지 않습니다.
          </video>
        )}
            </div>
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
