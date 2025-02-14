/* eslint-disable react-hooks/rules-of-hooks */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { CreateMeetingSchema } from "./CreateMeetingSchema"; // 위에서 만든 Yup 스키마
import withReactContent from "sweetalert2-react-content";
import { MdContentCopy } from "react-icons/md";
import { createRoom } from "../../api/RoomApi";
import { algorithmTag } from "../../utils/tags"; // ['수학','구현',... 등 긴 배열

const CreateMeetingForm = () => {
  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);

  // 폼 제출
  const handleSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);
    try {

      // 2) JSON payload 구성
      const payload = {
        title: values.title,
        description: values.description || "",
        tagNameList:values.tags, 
        accessCode: values.isPrivate ? values.entry_password : null,
        thumbnail:values.thumbnail,
      };

      // 3) 방 생성 API
      const response = await createRoom(payload);
      const inviteLink = `http://localhost:5174/meeting/${response.data}`;

      // 4) SweetAlert로 결과 표시
      MySwal.fire({
        title: "회의 생성 완료",
        showCloseButton: true,
        allowOutsideClick: false,
        html: (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
            <p style={{ margin: "10px 0" }}>회의 초대 링크</p>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
              <input
                type="text"
                readOnly
                value={inviteLink}
                style={{
                  width: "250px",
                  padding: "5px",
                  borderRadius: "5px",
                  border: "1px solid #ddd",
                  textAlign: "center",
                  fontSize: "14px"
                }}
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink).then(() => {
                    MySwal.fire({
                      text: "복사되었습니다!",
                      toast: true,
                      position: "top-end",
                      showConfirmButton: false,
                      timer: 1000
                    });
                  });
                }}
                style={{
                  backgroundColor: "#f3f4f6",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  padding: "5px 10px",
                  cursor: "pointer"
                }}
              >
                <MdContentCopy size={18} />
              </button>
            </div>
          </div>
        ),
        confirmButtonText: "확인"
      }).then((result) => {
        if (result.isConfirmed) {
          // "확인" 누르면 해당 링크로 이동
          navigate(`${inviteLink}`);
        }
      });
    } catch (error) {
      console.error("방 생성 실패:", error);
      Swal.fire({
        title: "방 생성 실패",
        text: "서버 오류가 발생했습니다. 다시 시도해주세요.",
        icon: "error",
        confirmButtonText: "확인",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-min-4xl mx-auto p-4 bg-base-200 rounded-md">
      <h2 className="text-xl font-bold mb-4">회의 만들기</h2>

      <Formik
        initialValues={{
          title: "",
          description: "",
          // 변경: tags 는 배열로 관리
          tags: [],
          isPrivate: false,
          isVisible: true,
          entry_password: "",
          thumbnail: null,
        }}
        validationSchema={CreateMeetingSchema}
        onSubmit={handleSubmit}
      >
        
        {({ setFieldValue, values, isSubmitting }) => {
          // 로컬 상태: 사용자 입력(tagInput), 추천 목록(suggestions)
          const [tagInput, setTagInput] = useState("");
          const [suggestions, setSuggestions] = useState([]);

          // tag 입력 변경 시 추천 태그 업데이트
          const handleChangeTagInput = (e) => {
            const inputValue = e.target.value;
            setTagInput(inputValue);

            if (!inputValue.trim()) {
              setSuggestions([]);
              return;
            }
            // algorithmTag 중 부분일치 필터링
            const matched = algorithmTag.filter((tag) =>
              tag.toLowerCase().includes(inputValue.toLowerCase())
            );
            setSuggestions(matched.slice(0, 5)); // 최대 5개까지만 예시
          };

          // 추천 태그 클릭 시, input 채우기
          const handleSuggestionClick = (tag) => {
            setTagInput(tag);
            setSuggestions([]);
          };

          // "추가" 버튼 클릭 -> 태그 추가
          const handleAddTag = () => {
            const trimTag = tagInput.trim();
            if (!trimTag) return;

            // 간단한 유효성 검사 (최대 3개, 중복, 길이 등)
            if (values.tags.length >= 5) {
              MySwal.fire("에러", "태그는 최대 5개까지 추가할 수 있습니다.", "error");
              return;
            }
            if (trimTag.length > 100) {
              MySwal.fire("에러", "태그는 최대 100자까지 가능합니다.", "error");
              return;
            }
            if (values.tags.includes(trimTag)) {
              MySwal.fire("에러", "이미 추가된 태그입니다.", "error");
              return;
            }

            // Formik의 tags 배열에 추가
            setFieldValue("tags", [...values.tags, trimTag]);
            // 입력창/추천 초기화
            setTagInput("");
            setSuggestions([]);
          };

          // 개별 태그 삭제
          const handleDeleteTag = (tagToDelete) => {
            setFieldValue(
              "tags",
              values.tags.filter((tag) => tag !== tagToDelete)
            );
          };

          return (
            <Form className="flex flex-col gap-4">
              {/* 회의 제목 */}
              <div className="form-control">
                <label className="label font-semibold">회의 제목</label>
                <Field
                  type="text"
                  name="title"
                  className="input input-bordered"
                  placeholder="예: 알고리즘 스터디"
                />
                <ErrorMessage name="title" component="div" className="text-red-500 text-sm" />
              </div>

              {/* 설명 */}
              <div className="form-control">
                <label className="label font-semibold">회의 설명</label>
                <Field
                  type="text"
                  name="description"
                  className="input input-bordered"
                  placeholder="예: 주 3회 모임"
                />
                <ErrorMessage
                  name="description"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              {/* 태그 입력 / 추천 / 추가 버튼 */}
              <div className="form-control">
                <label className="label font-semibold">태그</label>
                <div className="flex items-center gap-2">
                  {/* 태그 입력창 */}
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="태그 입력"
                    value={tagInput}
                    onChange={handleChangeTagInput}
                  />
                  {/* 추가 버튼 */}
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="btn btn-primary"
                  >
                    추가
                  </button>
                </div>

                {/* 자동완성 제안 목록 */}
                {suggestions.length > 0 && (
                  <ul className="bg-white border rounded-md shadow p-2 mt-1 z-10">
                    {suggestions.map((tag) => (
                      <li
                        key={tag}
                        className="p-1 hover:bg-gray-200 cursor-pointer"
                        onClick={() => handleSuggestionClick(tag)}
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}

                {/* 실제로 추가된 태그들 표시 */}
                <div className="flex flex-row flex-wrap gap-2 mt-2 max-w-lg">
                  {values.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="flex items-center px-2 py-1 bg-gray-200 rounded"
                    >
                      {tag}
                      <button
                        type="button"
                        className="ml-1 text-red-600 font-bold"
                        onClick={() => handleDeleteTag(tag)}
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* 썸네일 업로드 */}
              <div className="form-control">
                <label className="label font-semibold">썸네일 업로드</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    setFieldValue("thumbnail", e.target.files[0]);
                  }}
                  className="file-input file-input-bordered"
                />
                {values.thumbnail && (
                  <p className="text-sm mt-1">선택된 파일: {values.thumbnail.name}</p>
                )}
              </div>

              {/* 공개 여부 */}
              {/* <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text font-semibold">공개 여부</span>
                  <Field type="checkbox" name="isVisible" className="toggle toggle-primary" />
                </label>
              </div> */}

              {/* 비밀방 체크 */}
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text font-semibold">비밀방 설정</span>
                  <Field type="checkbox" name="isPrivate" className="toggle toggle-primary" />
                </label>
              </div>

              {/* 비밀번호 (isPrivate true일 때만) */}
              {values.isPrivate && (
                <div className="form-control">
                  <label className="label font-semibold">비밀번호 (최대 15자)</label>
                  <Field
                    type="password"
                    name="entry_password"
                    placeholder="비밀번호 입력"
                    className="input input-bordered"
                  />
                  <ErrorMessage
                    name="entry_password"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
              )}

              {/* 제출 버튼 */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-accent"
                >
                  {isSubmitting ? "생성 중..." : "회의 생성"}
                </button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default CreateMeetingForm;
