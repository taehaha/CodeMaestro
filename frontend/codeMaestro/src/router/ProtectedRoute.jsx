import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate,Outlet  } from "react-router-dom";
import Swal from "sweetalert2";

function ProtectedRoute() {
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      Swal.fire({
        title: "로그인이 필요합니다!",
        text: "코드 마에스트로의 회의 서비스는 로그인 후 이용 가능합니다.",
        confirmButtonText: "확인",
      }).then(() => {
        // SweetAlert 확인 버튼 누른 뒤 이동
        navigate("/login");
      });
    }
    // isLoggedIn이 바뀔 때마다 한 번씩만 Alert를 띄우고 싶다면
    // deps 배열 [isLoggedIn, navigate]로 충분합니다.
  }, [isLoggedIn, navigate]);

  // 로그인 전이라면 자식 컴포넌트(=보호된 페이지)는 렌더링하지 않음
  if (!isLoggedIn) {
    return null;
  }

  // 로그인된 상태라면 그대로 children 렌더링
  return <Outlet />;
}

export default ProtectedRoute;
