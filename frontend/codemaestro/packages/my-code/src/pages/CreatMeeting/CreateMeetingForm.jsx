import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { CreateMeetingSchema } from "./CreateMeetingSchema"; // 위에서 만든 Yup 스키마
import UserAxios from "../../api/userAxios"; // 실제 axios 연동 (주석 처리)
import withReactContent from "sweetalert2-react-content";
import { MdContentCopy } from "react-icons/md";

const CreateMeetingForm = () => {
  const navigate = useNavigate();

  // 방 링크 생성(6자리 랜덤)
  const generateRandomLink = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length: 6 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  };

  // 실제 제출 핸들러
  const handleSubmit = async (values, { setSubmitting }) => {
    // values -> Formik 폼 전체 값
    // isPrivate => boolean
    // entry_password => string (혹은 undefined)
    // tags => 쉼표로 구분된 문자열
    setSubmitting(true);
    try {
      // 1) url(랜덤링크) 생성
      const roomUrl = generateRandomLink();
      const inviteLink = `http://localhost:5174/meeting/${roomUrl}`;
      console.log(values);
      
      // 2) FormData로 변환 (multipart/form-data)
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description || "");
      formData.append("language", values.language);
      formData.append("tags", values.tags || "");
      formData.append("url", roomUrl);
      formData.append("visible", values.isVisible || "");

      // 비밀방 => password (없으면 null)
      formData.append("entry_password", values.isPrivate ? values.entry_password : "");

      // 썸네일 (파일)
      if (values.thumbnail) {
        formData.append("thumbnail", values.thumbnail); 
      }

      // 3) 백엔드 전송 (multipart/form-data) : 주석 처리
      /*
      const response = await UserAxios.post("/rooms", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const roomData = response.data;
      */

      // 4) 임시 응답 처리
      console.log("백엔드로 전송할 데이터 (multipart)", formData);

      const MySwal = withReactContent(Swal);
      MySwal.fire({
        title: "회의 생성 완료",
        showCloseButton: true,
        allowOutsideClick: false,
        html: (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
            <p style={{ margin: "10px 0" }}>회의 초대 링크</p>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
              {/* 초대 링크 입력창 */}
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
              {/* 복사 버튼 */}
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
        // result.isConfirmed === true -> "확인" 버튼 클릭 시점
        if (result.isConfirmed) {
          // 복사 버튼이 아닌 "확인" 버튼을 눌렀을 때만 이동
          navigate(`/meeting/${roomUrl}`, { state: { status: 200 } });
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
          language: "",
          tags: "",
          isPrivate: false,
          isVisible: true,
          entry_password: "",
          thumbnail: null,
        }}
        validationSchema={CreateMeetingSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, values, isSubmitting }) => (
          <Form className="flex flex-col gap-4">
            {/* 회의 제목 */}
            <div className="form-control">
              <label className="label font-semibold">회의 제목 (최대 20자)</label>
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
              <label className="label font-semibold">회의 설명 (최대 20자)</label>
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

            {/* 언어 선택 (단일) */}
            <div className="form-control">
              <label className="label font-semibold">사용 언어</label>
              <Field as="select" name="language" className="select select-bordered">
                <option value="">언어를 선택하세요</option>
                <option value="Java">Java</option>
                <option value="C">C</option>
                <option value="C++">C++</option>
                <option value="Python">Python</option>
              </Field>
              <ErrorMessage
                name="language"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            {/* 태그 (쉼표로 구분, 3개 이하, 각10자 이하) */}
            <div className="form-control">
              <label className="label font-semibold">태그 (최대 3개, 쉼표로 구분)</label>
              <Field
                type="text"
                name="tags"
                className="input input-bordered"
                placeholder="예: 알고리즘, 스터디"
              />
              <ErrorMessage
                name="tags"
                component="div"
                className="text-red-500 text-sm"
              />
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
            {/*공개 여부 체크 */
            <div className="form-control">
              <label className="label cursor-pointer">
              <span className="label-text font-semibold">공개 여부</span>
                <Field type="checkbox" name="isVisible" className="toggle toggle-primary" />
                </label>
              </div>}
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
        )}
      </Formik>
    </div>
  );
};

export default CreateMeetingForm;
