// 스타일 관련 파일
import './App.css';
import './index.css';
// 공통 컴포넌트
import Header from './components/Header';
import MainPage from './pages/MainPage';
import Contents from './components/Contents/Contents'
import WaveComponent  from './components/WaveComponent/WaveComponent'
import MainSection from './components/MainSection/MainSection';

// 페이지 컴포넌트
import CreateMeetingPage from './pages/CreatMeeting/CreateMeetingPage';
import MeetingPage from './pages/MeetingRoom/MeetingPage';
import MeetingRoom from './pages/Room/MeetingRoom';
import MyProfile from './pages/MyPage/MyProfile';
import MyPage from './pages/MyPage/MyPage';
import LoginPage from './pages/Auth/LoginPage';
import ForgotPassword from './pages/Auth/ForgotPassword';
import GroupPage from './pages/Group/GroupPage';
import EmailAuth from './pages/EmailAuth.js/EmailAuth';
// 프로텍트 라우트
import ProtectedRoute from './router/ProtectedRoute';

// React Router 관련
import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { persistor } from './reducer/store';
// 콘텍스트 api
import { NotificationsProvider } from './context/NotificationContext';

function App() {
  useEffect(() => {
    const handleBeforeUnload = () => {
      // purge()는 비동기로 동작하므로, 프로미스 결과는 무시할 수 있음
      persistor.purge();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // 컴포넌트 언마운트 시 이벤트 제거
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
      <NotificationsProvider>
      <div className="w-screen flex flex-col bg-primaryBg  dark:bg-darkPrimaryBg">
        {/* Header 영역 */}
        <Header />
        {/* Body 영역 */}
        <main
          className={`flex-1 flex flex-col overflow-y-auto`}>
          <Routes>
            {/* 로그인 필요x 페이지 */}
            <Route path='/' element={
              <>
              <MainSection />
              <Contents />
              <WaveComponent />
              </>
              } />
            <Route path="/login" element={<LoginPage />} />  
            <Route path="/signup" element={<EmailAuth></EmailAuth>}></Route>
            <Route path="/forgotpassword" element={<ForgotPassword />}></Route>
                        {/* 로그인 필요 페이지 */}
            <Route element={<ProtectedRoute />}>
              <Route path="/meeting" element={<MeetingPage />} />
              <Route path="/create-meeting" element={<CreateMeetingPage />}/>
              <Route path="/meeting/:id" element={<MeetingRoom />} />
              <Route path="/mypage" element={<MyPage />} />  
              <Route path="/group/:groupId" element={<GroupPage />} />
            </Route>
          </Routes>
        </main>
      </div> 
      </NotificationsProvider>

  );
}

export default App;