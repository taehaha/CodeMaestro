import { useState } from "react";

const FileUploadForm = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]); // 업로드된 파일 리스트
  const [errorMessage, setErrorMessage] = useState(""); // 에러 메시지

  // 허용되는 파일 확장자 목록
  const allowedExtensions = ["c", "java", "py"];

  // 파일 선택 핸들러
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files); // 선택된 파일을 배열로 변환
    const validFiles = []; // 유효한 파일 저장
    let isInvalid = false; // 유효하지 않은 파일 여부

    files.forEach((file) => {
      const fileExtension = file.name.split(".").pop().toLowerCase(); // 확장자 추출
      if (allowedExtensions.includes(fileExtension)) {
        validFiles.push(file); // 유효한 파일만 추가
      } else {
        isInvalid = true;
      }
    });

    if (isInvalid) {
      setErrorMessage(`${allowedExtensions.join(", ")} 파일만 올릴 수 있어요.`);
    } else {
      setErrorMessage(""); // 에러 메시지 초기화
    }

    setUploadedFiles((prev) => [...prev, ...validFiles]); // 유효한 파일만 추가
  };

  return (
    <div className="p-4 bg-primaryBoxcolor dark:bg-darkBoxColor rounded-sm">
      {/* 파일 업로드 버튼 */}
      <div className="flex items-center gap-4 mb-4 justify-center">
        <input
          type="file"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="btn btn-warning rounded-sm">
          UPLOAD
        </label>
      </div>

      {/* 에러 메시지 */}
      {errorMessage && (
        <div className="text-red-500 text-sm mb-2 text-center">
          {errorMessage}
        </div>
      )}

      {/* 업로드된 파일 목록 */}
      <div>
        <h2 className="dark:text-darkText font-semibold mb-2 text-center">
          redux 사용해서 저장하고, 업로드 누를때 같이 보내기
        </h2>
        <ul className="list-disc list-inside text-sm dark:text-darkText">
          {uploadedFiles.map((file, index) => (
            <li key={index}>{file.name}</li> // 파일 이름 표시
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FileUploadForm;
