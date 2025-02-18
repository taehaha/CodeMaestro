import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import PropTypes from "prop-types";
import { putUserInfo } from "../../api/AuthApi";
import getCroppedImg from "./getCroppedImg";
import Swal from "sweetalert2";
import { useSelector, useDispatch } from 'react-redux';
import { getMyInfo } from "../../reducer/userSlice";
const INITIAL_CROP = { x: 0, y: 0 };
const INITIAL_ZOOM = 1;

const EditBackgroundImage = ({ onClose }) => {
  const [imageSrc, setImageSrc] = useState(null); // 업로드된 이미지의 URL
  const [crop, setCrop] = useState(INITIAL_CROP); // 크롭 위치
  const [zoom, setZoom] = useState(INITIAL_ZOOM); // 줌 레벨
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null); // 크롭 영역 정보

  // 파일 업로드 핸들러
  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        // 이미지가 변경되면 크롭 상태 초기화
        setCrop(INITIAL_CROP);
        setZoom(INITIAL_ZOOM);
      };
      reader.onerror = () => {
        console.error("파일 읽기 오류");
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // 크롭 완료 후 영역 업데이트
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const dispatch = useDispatch();
  // 저장 버튼 핸들러
  const handleSave = useCallback(async () => {
    
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      // 크롭된 이미지 Data URL 생성
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);

      // 프로필 배경 이미지만 업데이트하도록 서버에 요청 (부분 업데이트)
      const responseData = await putUserInfo({
        profileBackgroundImage: croppedImage,
      });

      // API 모듈화 상태에 따라 응답 구조가 달라질 수 있으므로 적절히 수정
      if (responseData === 200 || responseData.status === 200) {

        await Swal.fire({
          title: "변경 완료",
          text: "프로필 배경이 변경되었습니다.",
          icon: "success",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "확인",
          iconColor:"#5FD87D",
          width: "500px",
          background: "#f8f9fa",
          customClass: {
            popup: "swal-custom-popup",       // 전체 팝업 스타일
            title: "swal-custom-title",       // 제목 스타일
            htmlContainer: "swal-custom-text", // 본문 텍스트 스타일
            confirmButton: "swal-custom-button" // 버튼 스타일
          }
        });
        // 성공 시 새로고침s
 
        await dispatch(getMyInfo());
        window.location.reload();
      } else {
        await Swal.fire({
          title: "오류",
          text: "프로필 배경 변경 중 문제가 발생했습니다.",
          icon: "error",
          width: "500px",
          background: "#f8f9fa",
          confirmButtonColor: "#FFCC00",
          confirmButtonText: "확인",
          customClass: {
            popup: "swal-custom-popup",       // 전체 팝업 스타일
            title: "swal-custom-title",       // 제목 스타일
            htmlContainer: "swal-custom-text", // 본문 텍스트 스타일
            confirmButton: "swal-custom-button" // 버튼 스타일
          }
        });
      }
      onClose();
    } catch (error) {
      console.error("이미지 크롭 오류:", error);
      await Swal.fire({
        title: "오류",
        text: "프로필 배경 변경 중 문제가 발생했습니다.",
        icon: "error",
        width: "500px",
          background: "#f8f9fa",
          confirmButtonColor: "#FFCC00",
          confirmButtonText: "확인",
          customClass: {
            popup: "swal-custom-popup",       // 전체 팝업 스타일
            title: "swal-custom-title",       // 제목 스타일
            htmlContainer: "swal-custom-text", // 본문 텍스트 스타일
            confirmButton: "swal-custom-button" // 버튼 스타일
          }
      });
    }
  }, [imageSrc, croppedAreaPixels, onClose]);

  const handleDelete= useCallback(async () => {
    
    try {

      // 프로필 배경 이미지만 업데이트하도록 서버에 요청 (부분 업데이트)
      const responseData = await putUserInfo({
        profileBackgroundImage: null,
      });

      // API 모듈화 상태에 따라 응답 구조가 달라질 수 있으므로 적절히 수정
      if (responseData === 200 || responseData.status === 200) {

        await Swal.fire({
          title: "변경 완료",
          text: "프로필 배경이 변경되었습니다.",
          icon: "success",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "확인",
          iconColor:"#5FD87D",
          width: "500px",
          background: "#f8f9fa",
          customClass: {
            popup: "swal-custom-popup",       // 전체 팝업 스타일
            title: "swal-custom-title",       // 제목 스타일
            htmlContainer: "swal-custom-text", // 본문 텍스트 스타일
            confirmButton: "swal-custom-button" // 버튼 스타일
          }
        });
        // 성공 시 새로고침s
 
        await dispatch(getMyInfo());
        window.location.reload();
      } else {
        await Swal.fire({
          title: "오류",
          text: "프로필 배경 변경 중 문제가 발생했습니다.",
          icon: "error",
          width: "500px",
          background: "#f8f9fa",
          confirmButtonColor: "#FFCC00",
          confirmButtonText: "확인",
          customClass: {
            popup: "swal-custom-popup",       // 전체 팝업 스타일
            title: "swal-custom-title",       // 제목 스타일
            htmlContainer: "swal-custom-text", // 본문 텍스트 스타일
            confirmButton: "swal-custom-button" // 버튼 스타일
          }
        });
      }
      onClose();
    } catch (error) {
      console.error("이미지 크롭 오류:", error);
      await Swal.fire({
        title: "오류",
        text: "프로필 배경 변경 중 문제가 발생했습니다.",
        icon: "error",
        width: "500px",
          background: "#f8f9fa",
          confirmButtonColor: "#FFCC00",
          confirmButtonText: "확인",
          customClass: {
            popup: "swal-custom-popup",       // 전체 팝업 스타일
            title: "swal-custom-title",       // 제목 스타일
            htmlContainer: "swal-custom-text", // 본문 텍스트 스타일
            confirmButton: "swal-custom-button" // 버튼 스타일
          }
      });
    }
  }, [imageSrc, croppedAreaPixels, onClose]);



  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-sm shadow-xl w-full max-w-md mx-4 sm:mx-0 p-6">
        <h2 className="text-2xl font-bold text-center mb-6">배경 이미지 변경</h2>

        {/* 파일 업로드 */}
        {!imageSrc && (
          <div className="mb-6">
            <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 mb-2">
              이미지를 선택하세요:
            </label>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                         file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0
                         file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700
                         hover:file:bg-indigo-100 focus:outline-none"
            />
          </div>
        )}

        {/* 이미지 크롭 */}
        {imageSrc && (
          <div className="relative w-full h-64 bg-gray-200 rounded mb-6 overflow-hidden">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={6 / 1} // 6:1 비율
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-sm text-sm font-medium bg-gray-200 text-gray-800
                       hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label="취소"
          >
            취소
          </button>
          {imageSrc && (
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-sm text-sm font-medium bg-indigo-600 text-white
                       hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              aria-label="저장"
            >
              저장
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

EditBackgroundImage.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default EditBackgroundImage;
