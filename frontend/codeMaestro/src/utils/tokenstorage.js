let memoryAccessToken = null;


// 여기서 access토큰을 관리한다 함...
// 새로고침시 사라짐, 대신 공격에 안전한 방식

const tokenStorage = {
// 토큰 저장
    setAccessToken: (token) => {
        memoryAccessToken = token ;
    },
// 토큰 불러오기
    getAccessToken: () => {
        return memoryAccessToken
    },

// 토큰 지우기
    removeAccessToken: () => {
        memoryAccessToken = null;
    }
}

export default tokenStorage