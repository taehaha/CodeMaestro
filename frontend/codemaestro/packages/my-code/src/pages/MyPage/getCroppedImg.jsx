/**
 * getCroppedImg 함수
 * @param {string} imageSrc - 원본 이미지의 Data URL 또는 URL
 * @param {Object} croppedAreaPixels - { x, y, width, height } 형식의 크롭 영역 정보
 * @returns {Promise<Blob>} - 크롭된 이미지의 Blob을 반환
 */
const getCroppedImg = (imageSrc, croppedAreaPixels) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.crossOrigin = "anonymous"; // 크로스오리진 이슈 방지

    image.onload = () => {
      // 캔버스 생성
      const canvas = document.createElement("canvas");
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      const ctx = canvas.getContext("2d");

      // 지정된 영역을 캔버스에 그림
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

      // 캔버스를 Blob으로 변환하여 반환 (파일처럼 사용 가능)
      canvas.toBlob((blob) => {
        if (!blob) {
          return reject(new Error("캔버스에서 Blob을 생성하지 못했습니다."));
        }
        resolve(blob); // Base64가 아니라 Blob 반환
      }, "image/jpeg");
    };

    image.onerror = (error) => {
      reject(error);
    };
  });
};

export default getCroppedImg;
