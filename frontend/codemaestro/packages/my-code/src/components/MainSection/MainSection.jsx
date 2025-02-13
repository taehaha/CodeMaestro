import React, { useEffect, useState } from 'react';
import './MainSection.css';

function MainSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 페이지 로딩 시 애니메이션 트리거
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);  // 컴포넌트 언마운트 시 타이머 제거
  }, []);

  return (
    <section className="main-section">
      <div className="text-content">
        <h1>
          우리 모두 함께해요, <br />
          <span className="highlight">코드 마에스트로</span>
        </h1>
        <p>실시간 협업 코딩과 AI기반 학습으로 더 나은 개발자가 되어보세요.</p>
        <div className={`buttons ${isVisible ? 'visible' : ''}`}>
          <button className="start-btn">무료로 시작하기</button>
        </div>
      </div>
    </section>
  );
}

export default MainSection;
