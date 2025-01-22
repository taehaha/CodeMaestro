import { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const CreateMeetingForm = ( {checkedUsers}) => {
    const [roomTitle, setRoomTitle] = useState("");
    const [language, setLanguage] = useState([]);
    const [tag, setTag] = useState("");
    const [isPassword, setIsPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [isTier, setisTier] = useState(false);
    const [tier, setTier] = useState(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 드롭다운 상태
    const navigate = useNavigate();

    const generateRandomLink = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result
    };

    // 이미지 셀렉트 구현
    // 백엔드 연결 시에는 유저 정보 속 티어까지 길이로 받아올 예정
    const options = Array.from({ length: 32 }, (_, i) => ({
      value: i,
      label: `Option ${i}`,
      image: `/solvedac/${i}.svg`,
    }));

    const submitMeeting = (event) => {
        event.preventDefault();

        const formData = {
            roomTitle,
            language,
            tag,
            privateRoom: isPassword,
            password,
            tierRestrice: isTier,
            tier,
        };
        const roomId = generateRandomLink();
        const inviteLink = `http://localhost:5173/meeting/${roomId}`;
        Swal.fire({
            title: "생성 완료",
            html: `
                <p style="margin: 10px 0;">회의 초대 링크</p>
                <div style="display: flex; align-items: center; gap: 10px; justify-content: center;">
                    <input 
                        type="text" 
                        value="${inviteLink}" 
                        readonly 
                        style="width: 250px; padding: 5px; border-radius: 5px; border: 1px solid #ddd; text-align: center; font-size: 14px;" 
                        id="inviteLink"
                    />
                    <button 
                        style="background; padding: 5px 10px; border: none; border-radius: 5px; cursor: pointer;" 
                        onclick="copyToClipboard('${inviteLink}')"
                    ><span id="faCopy"></span>
                    </button>
                </div>
            `,
            confirmButtonText: "확인",
            showCloseButton: true,
            allowOutsideClick: false,
        });
        console.log(formData);
        console.log("백단에 연결되면 axios로 이걸 보낼거에요");
        const res = {id:roomId} // 임시로 1로 설정 실제론 axios에 생성 요청 후 200 뜨면 받아온 정보 res.data에서 roomId 있을 것
        checkedUsers.map((user) => {
            console.log(`방 만들었으니까 ${user.id} 초대한다.`);
            
        })
        navigate(`/meeting/${res.id}`, { state: { response: 200 } });
    };

    const handleTier = (value) => {
      setTier(value);
      setIsDropdownOpen(false);
    }

    return (
        <form onSubmit={submitMeeting} className="bg-primaryBoxcolor dark:bg-darkBoxColor dark:text-darkText p-3 rounded-sm">
            <div className="form-control mb-4">
                <label htmlFor="roomtitle" className="label">
                    <span className="label-text font-semibold ">방 제목</span>
                </label>
                <input 
                    id="roomtitle"
                    type="text"
                    value={roomTitle}
                    onChange={(e) => setRoomTitle(e.target.value)}
                    className="input input-bordered rounded-sm w-full text-black"
                />
            </div>

            <div className="form-control mb-4">
                <span className="label-text font-semibold mb-2 ">언어</span>
                <div className="grid grid-cols-4 gap-2">
                    {["Python", "Java", "C++", "node.js"].map((lang) => (
                        <label key={lang} className="flex items-center space-x-1 text-xs ">
                            <input
                                type="checkbox"
                                value={lang.toLowerCase()}
                                checked={language.includes(lang.toLowerCase())}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setLanguage([...language, e.target.value]);
                                    } else {
                                        setLanguage(language.filter((l) => l !== e.target.value));
                                    }
                                }}
                                className="checkbox dark:checkbox-warning rounded-sm"
                            />
                            <span>{lang}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div className="form-control mb-4">
                <label htmlFor="tag" className="label">
                    <span className="label-text font-semibold ">태그</span>
                </label>
                <select
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="tag select select-bordered w-full text-black rounded-sm"
                >
                    <option value="알고리즘">알고리즘</option>
                    <option value="프로젝트">프로젝트</option>
                    <option value="스터디">스터디</option>
                </select>
            </div>
                        {/* <div className="form-control mb-4">
                <label htmlFor="useTier" className="label cursor-pointer">
                    <span className="label-text font-semibold ">Solvd.ac 티어제한</span>
                    <input
                        type="checkbox"
                        id="useTier"
                        checked={isTier}
                        onChange={(e) => setisTier(e.target.checked)}
                        className="toggle"
                    />
                </label>
            </div> */}
                        {isTier && (
              <div className="custom-select">
              {/* 현재 선택된 값 */}
              <div className="selected-value">
                {tier !== null && (
                  <div
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="flex items-center">
                    <img
                      src={options[tier].image}
                      alt={options[tier].label}
                      className="w-10 h-6"
                    />

                  </div>
                )}
              </div>
              {/* 옵션 목록 */}
              {isDropdownOpen && (<ul className="options max-h-[160px] overflow-y-auto">
                {options.map((option) => (
                  <li
                    key={option.value}
                    onClick={() => handleTier(option.value)}
                    className="flex items-center cursor-pointer hover:bg-gray-200 p-2"
                  >
                    <img
                      src={option.image}
                      alt={option.label}
                      className="w-full"
                    />
                  </li>
                ))}
              </ul>)}
            </div>
            )}
            <div className="form-control mb-4">
                <label htmlFor="usePassword" className="label cursor-pointer">
                    <span className="label-text font-semibold ">비밀방 생성</span>
                    <input
                        type="checkbox"
                        id="usePassword"
                        checked={isPassword}
                        onChange={(e) => setIsPassword(e.target.checked)}
                        className="toggle"
                    />
                </label>
            </div>
            {isPassword && (
                <div className="form-control mb-4">
                    <input
                        type="password"
                        placeholder="비밀번호를 입력하세요"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input input-bordered rounded-sm w-full text-black"
                    />
                </div>
            )}


            <button type="submit" className="btn btn-warning rounded-sm">회의 생성</button>
        </form>
    );
};

export default CreateMeetingForm;