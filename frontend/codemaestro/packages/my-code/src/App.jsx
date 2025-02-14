// App.js
import './App.css';
import './index.css';

// 공통 컴포넌트
import Header from './components/Header';
import MainPage from './pages/MainPage';
import Contents from './components/Contents/Contents';
import WaveComponent from './components/WaveComponent/WaveComponent';
import MainSection from './components/MainSection/MainSection';
import Footer from './components/Footer';

// 페이지 컴포넌트
import CreateMeetingPage from './pages/CreatMeeting/CreateMeetingPage';
import MeetingPage from './pages/MeetingRoom/MeetingPage';
import MeetingRoom from './pages/Room/MeetingRoom';
import MyPage from './pages/MyPage/MyPage';
import Community from './pages/Community/Community';
import LoginPage from './pages/Auth/LoginPage';
import ForgotPassword from './pages/Auth/ForgotPassword';
import GroupPage from './pages/Group/GroupPage';
import EmailAuth from './pages/EmailAuth.js/EmailAuth';
import PostDetail from './pages/Community/PostDetail';
import OAuth2RedirectHandler from './components/AutoLogin';
// 프로텍트 라우트
import ProtectedRoute from './router/ProtectedRoute';

// React Router 관련
import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { persistor } from './reducer/store';

// 콘텍스트 API (파일 내 export 이름이 NotificationsProvider로 되어 있어야 합니다)
import { NotificationsProvider } from './context/NotificationContext';
import PostsProvider from './context/PostsContext';
import CommentsProvider from './context/CommentsContext';
import PostCreate from './pages/Community/PostCreate';

import ProtectedIDE from './router/ProtectedIDE';

function App() {
  return (
    // <NotificationsProvider>
      <PostsProvider>
        <CommentsProvider>
          <div className="w-screen min-h-screen flex flex-col bg-primaryBg  dark:bg-darkPrimaryBg">
            {/* Header 영역 */}
            <Header />
            {/* Body 영역 */}
            <main
              className={`flex-1 flex flex-col`}>
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
                <Route path="/oauth2/signin" element={<OAuth2RedirectHandler />} />

                            {/* 로그인 필요 페이지 */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/meeting" element={<MeetingPage />} />
                  <Route path="/create-meeting" element={<CreateMeetingPage />}/>
                  <Route path="/meeting/:id" element={<MeetingRoom />} />
                  <Route path="/mypage" element={<MyPage />} />
                  <Route path="/boards" element={<Community />} />
                  <Route path="/boards/create" element={<PostCreate />} />
                  <Route path="/boards/:boardId" element={<PostDetail/>}></Route>
                  <Route path="/group/:groupId" element={<GroupPage />} />
                  <Route path="/ide" element={<ProtectedIDE />} />
                </Route>
              </Routes>
            </main>
            <Footer className="mt-auto"/>
          </div> 
        </CommentsProvider>
       </PostsProvider>
    // </NotificationsProvider>
  );
}

export default App;
