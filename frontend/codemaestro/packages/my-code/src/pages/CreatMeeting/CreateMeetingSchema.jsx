import * as Yup from "yup";

// 쉼표(,)로 구분하여 최대 3개, 각 10자 이하
const tagValidation = Yup.array()
  .of(Yup.string().max(100, "태그는 최대 100자까지 가능합니다."))
  .max(5, "태그는 최대 5개까지 추가할 수 있습니다.");

export const CreateMeetingSchema = Yup.object().shape({
  title: Yup.string()
    .required("스터디 제목을 입력해주세요.")
    .max(20, "제목은 최대 20자까지 가능합니다."),
  description: Yup.string()
    .max(20, "설명은 최대 20자까지 가능합니다."),
  tags: tagValidation,
  isPrivate: Yup.boolean(),
  entry_password: Yup.string().when("isPrivate", {
    is: true,
    then: (schema) => schema.required("비밀번호를 입력해주세요.").max(15, "비밀번호는 최대 15자"),
    otherwise: (schema) => schema.notRequired(),
  }),
});
