import { useState } from "react";
import Cropper from "react-easy-crop";

const EditBackgroundImage = ({onClose}) => {
  const [imageSrc, setImageSrc] = useState(null); // 업로드된 이미지 경로
  const [crop, setCrop] = useState({ x: 0, y: 0 }); // 크롭 위치
  const [zoom, setZoom] = useState(1); // 줌 레벨
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null); // 크롭 영역 정보

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result); // 이미지 미리 보기
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels); // 크롭된 영역 저장
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels); // 크롭된 이미지 추출, 이거 서버 보내는거 아직 미구현 상태

  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-xl font-bold mb-4">배경 이미지 변경 (깡통)</h2>

        {/* 파일 업로드 */}
        {!imageSrc && (
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        )}

        {/* 이미지 크롭 */}
        {imageSrc && (
          <div className="relative w-full h-40 bg-gray-200">
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

        {/* 버튼 */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold hover:bg-red-500"
          >
            취소
          </button>
          {imageSrc && (
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-semibold hover:bg-blue-700"
            >
              저장
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditBackgroundImage;
