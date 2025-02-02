import localStorage from "redux-persist/es/storage";

const LOCAL_STORAGE_KEY = 'access_token';

const tokenStorage = {
  setAccessToken: (token) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, token);
  },
  getAccessToken: () => {
    return localStorage.getItem(LOCAL_STORAGE_KEY);
  },
  removeAccessToken: () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  },
};

export default tokenStorage;


// let memoryAccessToken = null;


// // 여기서 access토큰을 관리해야 안전하다 함...
// // 새로고침시 사라짐, 대신 공격에 안전한 방식

// const tokenStorage = {
// // 토큰 저장
//     setAccessToken: (token) => {
//         console.log(token);
//         memoryAccessToken = token ;
//     },
// // 토큰 불러오기
//     getAccessToken: () => {
//         return memoryAccessToken
//     },

// // 토큰 지우기
//     removeAccessToken: () => {
//         memoryAccessToken = null;
//     }
// }

// export default tokenStorage