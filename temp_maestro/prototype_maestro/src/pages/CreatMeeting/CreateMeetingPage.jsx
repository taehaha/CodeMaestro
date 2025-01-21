import CreateMeetingForm from "./CreateMeetingForm"
import FileUploadForm from "./FileUploadForm"
import AudioMockUp from "./AudioMockUp"
const CreateMeetingPage = () =>{
    return(
<div className="flex flex-col lg:flex-row gap-6 lg:gap-20 p-3 dark:text-darkText mx-auto max-w-screen-4xl">
    <div className="w-full lg:w-1/2">
        <header className="header-style">오디오 음량 체크</header>
        <AudioMockUp />

        <header className="header-style">파일 업로드</header>
        <FileUploadForm />
    </div>
    <div className="w-full lg:w-1/2">
        <header className="header-style">회의 정보</header>
        <CreateMeetingForm />
    </div>
    </div>
    )
}

export default CreateMeetingPage