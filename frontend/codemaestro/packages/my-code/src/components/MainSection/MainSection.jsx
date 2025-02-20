import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
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
        <p>함께 보고, 함께 코딩하며 알고리즘 실력을 키우는 개발자들의 온라인 학습 공간</p>
        <div className={`buttons ${isVisible ? 'visible' : ''}`}>
        <Link to="/meeting">
          <button className="start-btn">무료로 시작하기</button>
        </Link>
        </div>
      </div>
    </section>
  );
}

export default MainSection;
