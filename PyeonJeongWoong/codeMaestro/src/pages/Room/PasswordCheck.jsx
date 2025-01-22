import { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import * as Yup from "yup"
import { Formik, Form, Field, ErrorMessage } from "formik";

const PasswordCheck = ({ roomId, title, onPasswordCheck }) => {
    // 패스워드 입력받을 공간 + 집으로 보낼 네비게이트
    const [password,setpassword] = useState("");
    const navigate = useNavigate()

    const validationSchema = Yup.object({
        password: Yup.string()
          .required("비밀번호를 입력해주세요.")
          .max(10, "비밀번호는 최대 10자리입니다."),
      });
    const handleSubmit = (values, { setSubmitting }) => {
        const { password } = values;
        // 이걸 axios로 보낸다.
        console.log({roomId, password});

        // 이건 404 응답 받았을때로 처리, 이 부분 반드시 수정해야함
        if (password === "404") {
            Swal.fire({
                title:"인증 실패",
                text:"비밀번호 인증에 실패하였습니다. 다시 확인해 주세요.",
                icon:"error",
                confirmButtonText:"확인"
            });
            setSubmitting(false);
            return
        }
        
        else {
            Swal.fire({
                title:"비밀번호 인증에 성공하였습니다.",
                icon:"success",
                confirmButtonText:"확인",
            }).then(()=>{
                onPasswordCheck();
            })
            setSubmitting(false);
        }

    }

    const handleCancel = () => {
        Swal.fire({
            title:"메인 페이지로 이동합니다.",
            icon: "warning",
            confirmButtonText:"확인",
        }).then(()=>{
            navigate("/")
        })
    };
    
    return (
        <div className="p-4 bg-primaryBoxcolor dark:bg-darkBoxColor shadow-md rounded-sm">
          <h3 className="text-center text-lg font-semibold mb-4">{title}</h3>
    
          <Formik
            initialValues={{ password: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                {/* 비밀번호 입력창 */}
                <div className="form-control">
                  <label
                    htmlFor="password"
                    className="label text-sm font-medium dark:text-darkText"
                  >
                    비밀번호를 입력하세요:
                  </label>
                  <Field
                    type="password"
                    id="password"
                    name="password"
                    placeholder="비밀번호 입력"
                    className="input input-bordered w-full dark:bg-gray-800"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
    
                {/* 버튼 영역 */}
                <div className="flex justify-center space-x-2">
                  <button
                    type="submit"
                    className="btn btn-primary w-24"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "확인 중..." : "확인"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-warning w-24"
                  >
                    취소
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      );
}

PasswordCheck.propTypes = {
        roomId: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        onPasswordCheck: PropTypes.func.isRequired,
    }
 
export default PasswordCheck