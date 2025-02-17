import * as Yup from "yup";
import { nicknameCheck } from "../../api/AuthApi"; // 기존에 사용하던 중복 검사 API

// 비밀번호 유효성검사 : 영어 숫자 특문 중 2개, 8자 이상.
const validatePasswordStrength = (value) => {
  if (!value) return false;
  let criteria = 0;
  if (/[a-zA-Z]/.test(value)) criteria++;   // 영문 포함 여부
  if (/\d/.test(value)) criteria++;         // 숫자 포함 여부
  if (/[\W_]/.test(value)) criteria++;       // 특수문자 포함 여부
  return criteria >= 2;
};

const SignUpValidationSchema = Yup.object().shape({
  // 닉네임: 공백 불가, 최대 10자, 그리고 중복검사(서버에서 200 응답 받아야 함)
  nickname: Yup.string()
  .required("닉네임은 필수 항목입니다.")
  .max(10, "닉네임은 최대 10자입니다."),
  // 비밀번호: 공백 불가, 최소 8자, 영문/숫자/특수문자 중 두 가지 이상 포함
  password: Yup.string()
    .required("비밀번호는 필수 항목입니다.")
    .min(8, "비밀번호는 8자 이상이어야 합니다.")
    .test(
      "password-strength",
      "비밀번호는 영문, 숫자, 특수문자 중 두 가지 이상을 포함해야 합니다.",
      (value) => validatePasswordStrength(value)
    ),
  // 자기소개: 최대 255자
  description: Yup.string().max(255, "자기소개는 최대 255자까지 입력 가능합니다."),
  agreement: Yup.boolean().oneOf([true], '약관에 동의해 주시길 바랍니다.')

});

export default SignUpValidationSchema