/**
 * getCroppedImg 함수
 * @param {string} imageSrc - 원본 이미지의 Data URL 또는 URL
 * @param {Object} croppedAreaPixels - { x, y, width, height } 형식의 크롭 영역 정보
 * @returns {Promise<string>} - 크롭된 이미지의 Data URL을 반환
 */
const getCroppedImg = (imageSrc, croppedAreaPixels) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageSrc;
      image.crossOrigin = "anonymous"; // 크로스오리진 이슈를 방지하기 위해
  
      image.onload = () => {
        // 캔버스 생성
        const canvas = document.createElement("canvas");
        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;
        const ctx = canvas.getContext("2d");
  
        // drawImage를 이용하여 지정 영역을 캔버스에 그림
        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        );
  
        // 캔버스 데이터를 Data URL로 변환
        canvas.toBlob((blob) => {
          if (!blob) {
            // blob 생성 실패
            return reject(new Error("캔버스에서 Blob을 생성하지 못했습니다."));
          }
          // Blob을 Data URL로 변환할 수 있음 (예: FileReader 사용) 또는 그대로 반환
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            resolve(reader.result);
          };
        }, "image/jpeg");
      };
  
      image.onerror = (error) => {
        reject(error);
      };
    });
  };
  
  export default getCroppedImg;
  