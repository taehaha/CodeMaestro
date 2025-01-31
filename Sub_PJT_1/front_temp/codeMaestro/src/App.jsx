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
import MyPage from './pages/MyPage/MyProfile';

import LoginPage from './pages/Auth/LoginPage';
import ForgotPassword from './pages/Auth/ForgotPassword';
import GroupPage from './pages/Group/GroupPage';
import EmailAuth from './pages/EmailAuth.js/EmailAuth';
// 프로텍트 라우트
import ProtectedRoute from './router/ProtectedRoute';

// React Router 관련
import { Routes, Route } from 'react-router-dom';
// 콘텍스트 api
import { NotificationsProvider } from './context/NotificationContext';

function App() {
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