// src/router/ProtectedIDE.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import tokenStorage from '../utils/tokenstorage';

const ProtectedIDE = () => {
  const navigate = useNavigate();
  const token = tokenStorage.getAccessToken();
 
  const persistedUser = JSON.parse(localStorage.getItem('persistedUser') || 'null');

  useEffect(() => {
    if (!token || !persistedUser) {
      Swal.fire({
        title: "로그인이 필요합니다!",
        text: "코드 마에스트로의 서비스는 로그인 후 이용 가능합니다.",
        icon: "warning",
        width: "500px",
        background: "#f8f9fa",
        confirmButtonColor: "#FFCC00",
        confirmButtonText: "확인",
        customClass: {
          popup: "swal-custom-popup",
          title: "swal-custom-title",
          htmlContainer: "swal-custom-text",
          confirmButton: "swal-custom-button"
        }
      }).then(() => {
        navigate("/login");
      });
    } else {
      navigate("/");
    }
  }, [token, persistedUser, navigate]);

  return null;
};

export default ProtectedIDE;
