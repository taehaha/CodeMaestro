import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import * as Yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Swal from "sweetalert2";
import userAxios from "../../api/userAxios";

const PasswordCheck = ({ roomId, title, onPasswordCheck }) => {
  // Formik 유효성 검사를 위한 Schema
  const validationSchema = Yup.object({
    password: Yup.string()
      .required("비밀번호를 입력해주세요.")
      .max(10, "비밀번호는 최대 10자리입니다."),
  });

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    const { password } = values;

    /* 
     * 1) 실제 백엔드 요청 예시 (주석 처리)
     * try {
     *   const response = await userAxios.post(`/room/${roomId}/check`, { password });
     *   if (response.status === 200) {
     *     // 인증 성공
     *     Swal.fire({
     *       title: "비밀번호 인증에 성공하였습니다.",
     *       icon: "success",
     *       confirmButtonText: "확인",
     *     }).then(() => {
     *       onPasswordCheck();
     *     });
     *   }
     * } catch (error) {
     *   // 인증 실패 시(404, 401 등)
     *   setFieldError("password", "비밀번호 인증에 실패하였습니다. 다시 확인해주세요.");
     *   setSubmitting(false);
     *   return;
     * }
     */

    // ============= 더미 로직 (유지) =============
    // password === "404" 라면 인증 실패로 가정 (inline 에러 표시)
    if (password === "404") {
      setFieldError("password", "비밀번호 인증에 실패하였습니다. 다시 확인해주세요.");
      setSubmitting(false);
      return;
    }

    // 성공 가정
    Swal.fire({
      title: "비밀번호 인증에 성공하였습니다.",
      icon: "success",
      iconColor:"#5FD87D",
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
    }).then(() => {
      onPasswordCheck();
    });

    setSubmitting(false);
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="card bg-base-100 p-4">
        <div className="card-body">
          <h3 className="text-center text-lg font-semibold mb-4">{title}</h3>

          <Formik
            initialValues={{ password: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="form-control space-y-4">
                {/* 비밀번호 입력 */}
                <label htmlFor="password" className="label">
                  <span className="label-text">비밀번호를 입력하세요:</span>
                </label>
                <Field
                  type="password"
                  id="password"
                  name="password"
                  placeholder="비밀번호 입력"
                  className="input input-bordered w-full"
                />
                {/* ErrorMessage를 통해 password 필드의 에러(유효성+인증 실패) 표시 */}
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "확인 중..." : "확인"}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

PasswordCheck.propTypes = {
  roomId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  onPasswordCheck: PropTypes.func.isRequired,
};

export default PasswordCheck;
