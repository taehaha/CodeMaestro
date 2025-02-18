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
  const dispatch = useDispatch();

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

  // 배경 이미지 제거 핸들러
  const handleDelete = useCallback(async () => {
    const userConfirm = await Swal.fire({
      title: "배경 이미지 제거",
      text: "정말로 배경 이미지를 제거하시겠습니까?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "예, 제거합니다.",
      cancelButtonText: "아니오",
      width: "500px",
      background: "#f8f9fa",
      confirmButtonColor: "#FFCC00",
      cancelButtonColor: "#d2d2d2",
      customClass: {
        popup: "swal-custom-popup",
        title: "swal-custom-title",
        htmlContainer: "swal-custom-text",
        confirmButton: "swal-custom-button",
      },
    });
    if (!userConfirm.isConfirmed) return;

    try {
      const responseData = await putUserInfo({
        profileBackgroundImage: null,
      });
      if (responseData?.status === 200 || responseData === 200) {
        await Swal.fire({
          title: "제거 완료",
          text: "배경 이미지가 제거되었습니다.",
          icon: "success",
          iconColor: "#5FD87D",
          width: "500px",
          background: "#f8f9fa",
          confirmButtonColor: "#FFCC00",
          confirmButtonText: "확인",
          customClass: {
            popup: "swal-custom-popup",
            title: "swal-custom-title",
            htmlContainer: "swal-custom-text",
            confirmButton: "swal-custom-button",
          },
        });
        await dispatch(getMyInfo());
        window.location.reload(); // 필요에 따라 제거 혹은 다른 방식으로 리프레시
      } else {
        throw new Error("서버 응답 오류");
      }
    } catch (error) {
      console.error("배경 이미지 제거 실패:", error);
      Swal.fire({
        title: "오류",
        text: "배경 이미지 제거 중 문제가 발생했습니다.",
        icon: "error",
        width: "500px",
        background: "#f8f9fa",
        confirmButtonColor: "#FFCC00",
        confirmButtonText: "확인",
        customClass: {
          popup: "swal-custom-popup",
          title: "swal-custom-title",
          htmlContainer: "swal-custom-text",
          confirmButton: "swal-custom-button",
        },
      });
    }
  });

  // 저장 버튼 핸들러
  const handleSave = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      // 크롭된 이미지 Data URL 생성
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);

      // 프로필 배경 이미지만 업데이트하도록 서버에 요청
      const responseData = await putUserInfo({
        profileBackgroundImage: croppedImage,
      });

      if (responseData?.status === 200 || responseData === 200) {
        await Swal.fire({
          title: "변경 완료",
          text: "프로필 배경이 변경되었습니다.",
          icon: "success",
          confirmButtonText: "확인",
          iconColor: "#5FD87D",
          width: "500px",
          background: "#f8f9fa",
          customClass: {
            popup: "swal-custom-popup",
            title: "swal-custom-title",
            htmlContainer: "swal-custom-text",
            confirmButton: "swal-custom-button",
          },
        });
        // 성공 시 새로고침
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
            popup: "swal-custom-popup",
            title: "swal-custom-title",
            htmlContainer: "swal-custom-text",
            confirmButton: "swal-custom-button",
          },
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
          popup: "swal-custom-popup",
          title: "swal-custom-title",
          htmlContainer: "swal-custom-text",
          confirmButton: "swal-custom-button",
        },
      });
    }
  }, [imageSrc, croppedAreaPixels, onClose, dispatch]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg mx-4 sm:mx-0 p-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">배경 이미지 변경</h2>

        {/* 파일 업로드 */}
        {!imageSrc && (
          <div className="mb-6">
            <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 mb-2">
              이미지를 선택하세요:
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="cursor-pointer w-full h-40 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-400 transition-all duration-200">
                <span className="text-gray-500 text-sm">이미지 업로드</span>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* 이미지 크롭 */}
        {imageSrc && (
          <div className="relative w-full h-72 bg-gray-100 rounded-lg mb-6 overflow-hidden shadow-inner">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={6 / 1} // 가로가 6, 세로가 1 비율
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium bg-[#ddd] text-gray-800 hover:bg-[#ccc]"
          >
            취소
          </button>
          {imageSrc && (
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-md text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-all duration-200"
              >
                제거
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-md text-sm font-medium bg-yellow-400 text-white hover:bg-yellow-500 transition-all duration-200"
              >
                저장
              </button>
            </div>
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
