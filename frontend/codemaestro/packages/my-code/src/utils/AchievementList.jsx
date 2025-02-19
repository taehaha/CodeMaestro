export const AchievementList = [
    /* -----------------------------
     * 1) 참석 횟수 (attend)
     * ----------------------------- */
    {
      id: 1,
      type: "attend",
      title: "초보 참석러",
      content: "스터디 5회 참여하기",
      condition: 5,        // 5번 
      value: "bronze",
    },
    {
      id: 2,
      type: "attend",
      title: "모범 참석러",
      content: "스터디 10회 참여하기",
      condition: 10,       // 10번
      value: "silver",
    },
    {
      id: 3,
      type: "attend",
      title: "프로 참석러",
      content: "스터디 20회 참여하기",
      condition: 20,       // 20번
      value: "gold",
    },
    {
      id: 4,
      type: "attend",
      title: "Maestro 참석러",
      content: "스터디 30회 참여하기",
      condition: 30,       // 30번
      value: "platinum",
    },
  
    /* -----------------------------
     * 2) 누적 시간 (duration, 초 단위)
     * ----------------------------- */
    {
      id: 5,
      type: "duration",
      title: "스터디 뉴비",
      content: "총 참여 시간 1시간 달성",
      condition: 3600,     // 1시간
      value: "bronze",
    },
    {
      id: 6,
      type: "duration",
      title: "스터디 중독자",
      content: "총 참여 시간 5시간 달성",
      condition: 18000,    // 5시간
      value: "silver",
    },
    {
      id: 7,
      type: "duration",
      title: "스터디 고인물",
      content: "총 참여 시간 10시간 달성",
      condition: 36000,    // 10시간
      value: "gold",
    },
    {
      id: 8,
      type: "duration",
      title: "스터디 지박령",
      content: "총 참여 시간 20시간 달성",
      condition: 72000,    // 20시간
      value: "platinum",
    },
  
    /* -----------------------------
     * 3) 미션 달성 (achive)
     * ----------------------------- */
    {
      id: 9,
      type: "achive",
      title: "알고린이",
      content: "도전과제 2개 달성",
      condition: 2,        // 2개
      value: "bronze",
    },
    {
      id: 10,
      type: "achive",
      title: "알고리즘 입문자",
      content: "도전과제 5개 달성",
      condition: 5,        // 5개
      value: "gold",
    },
    {
      id: 11,
      type: "achive",
      title: "알고리즘 고수",
      content: "도전과제 8개 달성",
      condition: 8,        // 8개
      value: "platinum",
    },
    {
      id: 12,
      type: "achive",
      title: "Code Maestro",
      content: "모든 도전과제 달성",
      condition: 11,       // 11개
      value: "diamond",    // 유일한 다이아몬드
    },
  ];
  