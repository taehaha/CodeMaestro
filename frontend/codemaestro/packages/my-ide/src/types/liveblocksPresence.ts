// /types/liveblocksPresence.ts

export interface MyPresence {
    user?: {
      name?: string;       // 사용자의 닉네임
      avatar?: string;     // 사용자의 아바타 URL (선택 사항)
      color?: string;      // 사용자 대표 색상 (예: 커서 색상)
      colorLight?: string; // 밝은 버전의 색상 (예: 하이라이트 용)
    };
  }
  