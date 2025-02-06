import * as Yup from "yup";

// 쉼표(,)로 구분하여 최대 3개, 각 10자 이하
const tagValidation = Yup.string()
  .test("tag-split", "태그는 쉼표(,)로 구분해 최대 3개, 각 10자 이하로 입력해주세요.", (value) => {
    if (!value) return true; // 비어있다면 통과
    const tags = value.split(",").map((t) => t.trim());
    if (tags.length > 3) return false; // 3개 초과
    return tags.every((t) => t.length <= 10); // 각 태그 10자 이하
  });

export const CreateMeetingSchema = Yup.object().shape({
  title: Yup.string()
    .required("회의 제목을 입력해주세요.")
    .max(20, "제목은 최대 20자까지 가능합니다."),
  description: Yup.string()
    .max(20, "설명은 최대 20자까지 가능합니다."),
  language: Yup.string()
    .oneOf(["Java", "C", "C++", "Python"], "올바른 언어를 선택해주세요.")
    .required("언어를 선택해주세요."),
  tags: tagValidation,
  isPrivate: Yup.boolean(),
  entry_password: Yup.string().when("isPrivate", {
    is: true,
    then: (schema) => schema.required("비밀번호를 입력해주세요.").max(15, "비밀번호는 최대 15자"),
    otherwise: (schema) => schema.notRequired(),
  }),
});
