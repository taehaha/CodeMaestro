import { PropTypes } from "prop-types";
import { useState, useEffect } from 'react';
import "./EditProfile.css"
import Swal from "sweetalert2";

// 유저정보 수정,탈퇴퇴 로직
import { putUserInfo, deleteUserInfo } from "../../api/AuthApi";
// 수정 후 유저정보 갱신 로직
import { useDispatch } from "react-redux";
import { getMyInfo,setLoggedOut } from "../../reducer/userSlice";

const EditProfile = ({ user, onClose, onDelete }) => {
 // 상태 관리
 const [nickname, setNickname] = useState(user.name || "");
 const [description, setDescription] = useState(user.description || "");
 const [profileImage, setProfileImage] = useState(user.profileImage || null);
//  const [isEditingNickname, setIsEditingNickname] = useState(false);
//  const [isEditingDescription, setIsEditingDescription] = useState(false);

 // 기존 정보 변경 시 업데이트
 useEffect(() => {
  setNickname(user.userNickName || "");
  setDescription(user.description || "");
  setProfileImage(user.profileImage || null);
}, [user]);

 // 이미지 업로드 핸들러
 const handleImageUpload = (event) => {
     const file = event.target.files[0];
     if (file) {
         const reader = new FileReader();
         reader.onloadend = () => {
             setProfileImage(reader.result);
         };
         reader.readAsDataURL(file);
     }
 };

 // 이미지 제거 핸들러
 const handleRemoveImage = () => {
     setProfileImage(null);
 };

 // 수정 버튼 클릭 시 변경된 내용 적용(더미 테스트용용)
//  const handleUpdate = () => {
//   const updatedUser = {
//     ...user,
//     name: nickname,
//     description: description,
//     profileImage: profileImage,
//   };
//   console.log("업데이트된 사용자 정보:", updatedUser);
//   alert("프로필이 업데이트되었습니다!");
// };
const dispatch = useDispatch();

const handleUpdate = async () => {
  try {
    // 업데이트할 유저 정보 생성
    const updatedUser = {
      nickname, // 백엔드에서 name이 아니라 nickname 사용
      description,
      profileImage,
    };
    console.log("업데이트된 사용자 정보:", updatedUser);
    // 유저 정보 업데이트 API 호출
    await putUserInfo(updatedUser);
    // Redux 상태 업데이트 (유저 정보 새로 불러오기)
    await dispatch(getMyInfo());
    // 업데이트 성공 알림 후 페이지 새로고침
    alert("프로필이 업데이트되었습니다!");
    window.location.reload();
  } catch (error) {
    console.error("유저 정보 업데이트 실패:", error);
    alert("프로필 업데이트 중 오류가 발생했습니다.");
  }
};



  // 탈퇴 버튼 클릭 시 실행
  // const handleDelete = () => {
  //   if (window.confirm("정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
  //     onDelete();
  //     alert("탈퇴가 완료되었습니다.");
  //   }
  // };

  // 회원 탈퇴 로직 >> 2번 물어서 확인시 로직보냄, 취소 시 그냥 취소.
  const handleDelete = async () => {
    try {
      // 첫 번째 확인 알림
      const firstConfirm = await Swal.fire({
        title: "회원 탈퇴",
        text: "정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "예, 탈퇴하겠습니다.",
        cancelButtonText: "아니요",
      });
  
      if (!firstConfirm.isConfirmed) return; // 취소 시 종료
  
      // 두 번째 확인 알림
      const secondConfirm = await Swal.fire({
        title: "정말로 탈퇴하시겠습니까?",
        text: "이 작업 이후 계정 복구는 불가능합니다.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "예, 확실합니다.",
        cancelButtonText: "아니요",
      });
  
      if (!secondConfirm.isConfirmed) return; // 취소 시 종료
  
      // 회원 탈퇴 API 호출
      const response = await deleteUserInfo();
  
      if (response.status === 200 || response.status === 204) {
        await Swal.fire({
          title: "탈퇴 완료",
          text: "회원 탈퇴가 완료되었습니다. 그동안 Code Maestro를 이용해주셔서 감사합니다.",
          icon: "success",
          confirmButtonText: "확인",
        });
  
        // 메인 페이지로 이동
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
      });
    }
  };


  return (
    <div className="edit-profile-container">
    {/* 프로필 이미지 업로드 */}
    <div className="profile-image-container">
      <div className="profile-image-preview">
        {profileImage ? (
          <img src={profileImage} alt="프로필 이미지" className="profile-image" />
        ) : (
          <div className="empty-profile-image"></div>
        )}
      </div>

      <div className="image-buttons">
        <label className="upload-btn">
          이미지 업로드
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </label>
        <button className="img-remove-btn" onClick={handleRemoveImage}>사진 제거</button>
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
      <button className="delete-btn" onClick={handleDelete}>탈퇴</button>
      <button className="update-btn" onClick={handleUpdate}>수정</button>
    </div>
    </div>
  );
};

EditProfile.propTypes = {
  user: PropTypes.object.isRequired,
  onClose:PropTypes.func.isRequired, // children은 반드시 전달되어야 함
  onDelete: PropTypes.func.isRequired,
};

export default EditProfile;