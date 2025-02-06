import { PropTypes } from "prop-types";
import { useState, useEffect } from 'react';
import "./EditProfile.css"

const EditProfile = ({ user, onClose, onDelete }) => {
 // 상태 관리
 const [nickname, setNickname] = useState(user.name || "");
 const [description, setDescription] = useState(user.description || "");
 const [profileImage, setProfileImage] = useState(user.profileImage || null);
//  const [isEditingNickname, setIsEditingNickname] = useState(false);
//  const [isEditingDescription, setIsEditingDescription] = useState(false);

 // 기존 정보 변경 시 업데이트
 useEffect(() => {
  setNickname(user.name || "");
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

 // 수정 버튼 클릭 시 변경된 내용 적용
 const handleUpdate = () => {
  const updatedUser = {
    ...user,
    name: nickname,
    description: description,
    profileImage: profileImage,
  };
  console.log("업데이트된 사용자 정보:", updatedUser);
  alert("프로필이 업데이트되었습니다!");
};

  // 탈퇴 버튼 클릭 시 실행
  const handleDelete = () => {
    if (window.confirm("정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      onDelete();
      alert("탈퇴가 완료되었습니다.");
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