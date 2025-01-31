// 스타일 관련 파일
import './App.css';
import './index.css';
// 공통 컴포넌트
import Header from './components/Header';
import AutoLogin from './components/AutoLogin';
// 페이지 컴포넌트
import CreateMeetingPage from './pages/CreatMeeting/CreateMeetingPage';
import MeetingPage from './pages/MeetingRoom/MeetingPage';
import MeetingRoom from './pages/Room/MeetingRoom';
import MyPage from './pages/MyPage/MyPage';
import MainPage from './pages/MainPage';
import LoginPage from './pages/Auth/LoginPage';
// 프로텍트 라우트
import ProtectedRoute from './router/ProtectedRoute';

// React Router 관련
import { Routes, Route } from 'react-router-dom';
// 콘텍스트 api
import { NotificationsProvider } from './context/NotificationContext';

function App() {
  return (
      <NotificationsProvider>
      <div className="w-screen h-screen flex flex-col bg-primaryBg  dark:bg-darkPrimaryBg">
        {/* Header 영역 */}
        <Header />
        {/* Body 영역 */}
        <main
          className={`flex-1 flex flex-col overflow-y-auto`}>
          <Routes>
            {/* 로그인 필요x 페이지 */}
            <Route path='/' element={<MainPage />} />
            <Route path="/login" element={<LoginPage />} />  

            {/* 로그인 필요 페이지 */}
            <Route element={<ProtectedRoute />}>
              <Route path="/meeting" element={<MeetingPage />} />
              <Route path="/create-meeting" element={<CreateMeetingPage />}/>
              <Route path="/meeting/:id" element={<MeetingRoom />} />
              <Route path="/profile" element={<MyPage />} />  
            </Route>

            <Route path="/oauth/kakao" element={<AutoLogin provider="kakao" />} />
            <Route path="/oauth/naver" element={<AutoLogin provider="naver" />} />
            <Route path="/oauth/google" element={<AutoLogin provider="google" />} />
          </Routes>
        </main>
      </div> 
      </NotificationsProvider>

  );
}

export default App;