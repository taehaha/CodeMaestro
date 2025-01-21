// 스타일 관련 파일
import './App.css';
import './index.css';
// 공통 컴포넌트
import Header from './components/Header';
import HeaderTemp from './components/header_temp';
// 페이지 컴포넌트
import CreateMeetingPage from './pages/CreatMeeting/CreateMeetingPage';
import MeetingPage from './pages/MeetingRoom/MeetingPage';
import MeetingRoom from './pages/Room/MeetingRoom';
import MyPage from './pages/MyPage/MyPage';
import MainPage from './pages/MainPage';

// React Router 관련
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
      <div className="w-screen h-screen flex flex-col bg-primaryBg  dark:bg-darkPrimaryBg">
        {/* Header 영역 */}
        <Header />
        {/* Body 영역 */}
        <main
          className={`flex-1 flex flex-col overflow-auto`}>
          <Routes>
            <Route path='/' element={<MainPage />} />
            <Route path="/meeting" element={<MeetingPage />} />
            <Route path="/create-meeting" element={<CreateMeetingPage />}/>
            <Route path="/meeting/:id" element={<MeetingRoom />} />
            <Route path="/profile" element={<MyPage />} />  
          </Routes>
        </main>
      </div> 
  );
}

export default App;