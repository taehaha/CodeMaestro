import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import "./EditProfile.css";
import Swal from "sweetalert2";

// 유저정보 수정, 탈퇴 API
import { putUserInfo, deleteUserInfo } from "../../api/AuthApi";
// Redux 액션 및 디스패치
import { useDispatch } from "react-redux";
import { getMyInfo, setLoggedOut } from "../../reducer/userSlice";

const EditProfile = ({ user, onClose, onDelete }) => {
  // 상태 관리: 기존에는 URL 형태의 프로필 이미지가 저장되어 있었으므로,
  // 미리보기 URL은 previewImage, 새로 업로드한 파일은 profileImage 상태에 저장합니다.
  const [nickname, setNickname] = useState(user.nickname || "");
  const [description, setDescription] = useState(user.description || "");
  const [profileImage, setProfileImage] = useState(null); // 파일 객체
  const [previewImage, setPreviewImage] = useState(user.profileImage || null); // 미리보기 URL

  useEffect(() => {
    setNickname(user.nickname || "");
    setDescription(user.description || "");
    setPreviewImage(user.profileImageUrl || null);
    setProfileImage(null);
  }, [user]);

  // 이미지 업로드 핸들러: 파일 객체를 상태에 저장하고 미리보기 URL 생성
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // 이미지 제거 핸들러
  const handleRemoveImage = () => {
    setProfileImage(null);
    setPreviewImage(null);
  };

  const dispatch = useDispatch();

  // 수정 버튼 클릭 시: FormData를 생성해 파일과 텍스트 데이터를 함께 전송
  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("nickname", nickname);
      formData.append("description", description);
      // 새로 업로드한 파일이 있는 경우에만 추가
      if (profileImage && profileImage instanceof File) {
        formData.append("profileImage", profileImage);
      }
      console.log("업데이트할 formData:", formData);

      await putUserInfo(formData);
      await dispatch(getMyInfo());
      alert("프로필이 업데이트되었습니다!");
      window.location.reload();
    } catch (error) {
      console.error("유저 정보 업데이트 실패:", error);
      alert("프로필 업데이트 중 오류가 발생했습니다.");
    }
  };

  // 회원 탈퇴 로직 (두 번의 확인)
  const handleDelete = async () => {
    try {
      const firstConfirm = await Swal.fire({
        title: "회원 탈퇴",
        text: "정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "예, 탈퇴하겠습니다.",
        cancelButtonText: "아니요",
        width: "500px",
        background: "#f8f9fa",
        confirmButtonColor: "#FFCC00",
        cancelButtonColor: "#d2d2d2",
        customClass: {
          popup: "swal-custom-popup",       // 전체 팝업 스타일
          title: "swal-custom-title",       // 제목 스타일
          htmlContainer: "swal-custom-text", // 본문 텍스트 스타일
          confirmButton: "swal-custom-button" // 버튼 스타일
        }
      });
  
      if (!firstConfirm.isConfirmed) return;
  
      const secondConfirm = await Swal.fire({
        title: "정말로 탈퇴하시겠습니까?",
        text: "이 작업 이후 계정 복구는 불가능합니다.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "예, 확실합니다.",
        cancelButtonText: "아니요",
        width: "500px",
        background: "#f8f9fa",
        confirmButtonColor: "#FFCC00",
        cancelButtonColor: "#d2d2d2",
        customClass: {
          popup: "swal-custom-popup",       // 전체 팝업 스타일
          title: "swal-custom-title",       // 제목 스타일
          htmlContainer: "swal-custom-text", // 본문 텍스트 스타일
          confirmButton: "swal-custom-button" // 버튼 스타일
        }
      });
  
      if (!secondConfirm.isConfirmed) return;
  
      const response = await deleteUserInfo();
  
      if (response.status === 200 || response.status === 204) {
        await Swal.fire({
          title: "탈퇴 완료",
          text: "회원 탈퇴가 완료되었습니다. \n그동안 코드 마에스트로를 이용해주셔서 감사합니다.",
          icon: "success",
          confirmButtonText: "확인",
          iconColor:"#5FD87D",
          width: "500px",
          background: "#f8f9fa",
          confirmButtonColor: "#FFCC00",
          customClass: {
            popup: "swal-custom-popup",       // 전체 팝업 스타일
            title: "swal-custom-title",       // 제목 스타일
            htmlContainer: "swal-custom-text", // 본문 텍스트 스타일
            confirmButton: "swal-custom-button" // 버튼 스타일
          }

        });
        await dispatch(setLoggedOut());
        window.location.replace("/");
      } else {
        throw new Error("서버 응답 오류");
      }
    } catch (error) {
      console.error("회원 탈퇴 실패:", error);
      Swal.fire({
        title: "오류 발생",
        text: "회원 탈퇴 중 문제가 발생했습니다. 다시 시도해주세요.",
        icon: "error",
        confirmButtonText: "확인",
        width: "500px",
        background: "#f8f9fa",
        confirmButtonColor: "#FFCC00",
        customClass: {
          popup: "swal-custom-popup",       // 전체 팝업 스타일
          title: "swal-custom-title",       // 제목 스타일
          htmlContainer: "swal-custom-text", // 본문 텍스트 스타일
          confirmButton: "swal-custom-button" // 버튼 스타일
        }
      });
    }
  };

  return (
    <div className="edit-profile-container">
      {/* 프로필 이미지 업로드 영역 */}
      <div className="profile-image-container">
        <div className="profile-image-preview">
          {previewImage ? (
            <img src={previewImage} alt="프로필 이미지" className="profile-image" />
          ) : (
            <div className="empty-profile-image"></div>
          )}
        </div>
        <div className="image-buttons">
          <label className="upload-btn">
            이미지 업로드
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </label>
          <button className="img-remove-btn" onClick={handleRemoveImage}>
            사진 제거
          </button>
        </div>
      </div>

      {/* 이메일 (수정 불가) */}
      <div className="edit-input-group">
        <label className="edit-input-label">이메일</label>
        <input type="email" value={user.email} disabled className="input-field disabled" />
      </div>

      {/* 닉네임 수정 */}
      <div className="edit-input-group">
        <label className="edit-input-label">닉네임</label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="input-field"
        />
      </div>

      {/* 자기소개 수정 */}
      <div className="edit-input-group">
        <label className="edit-input-label">자기소개</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-field textarea"
        />
      </div>

      {/* 버튼 영역 */}
      <div className="button-container">
        <button className="delete-btn" onClick={handleDelete}>
          탈퇴
        </button>
        <button className="update-btn" onClick={handleUpdate}>
          수정
        </button>
      </div>
    </div>
  );
};

EditProfile.propTypes = {
  user: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default EditProfile;
