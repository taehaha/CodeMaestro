// import { useState } from "react";
// import UserAxios from "../../api/userAxios";
// import Swal from "sweetalert2";
// import { FriendRequest } from "../../api/FriendApi";

// const GroupInvite = () => {
//   const [input, setInput] = useState("");
//   const [result, setResult] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // 사용자 검색 API 호출 함수
//   const getSearchUser = async (keyword) => {
//     setLoading(true);
//     try {
//       const response = await UserAxios.get("/users/search", {
//         params: { userName: keyword },
//       });
//       return response.data; // 실제 서버 데이터 구조에 맞게 수정 필요
//     } catch (error) {
//       console.error("유저 검색 중 오류:", error);
//       // 임시 더미 데이터 반환 (실제 구현 시 오류 메시지 등을 표시)
//       return [
//         {
//           id: 5,
//           name: "익명 8421",
//           email: "test@test.com",
//           description: "오늘도 열심히 코딩합시다",
//         },
//         {
//           id: 6,
//           name: "익명 1248",
//           email: "test@2.com",
//           description: "서치 결과 더미데이터.",
//         },
//       ];
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInput = (e) => {
//     setInput(e.target.value);
//   };

//   // 폼 submit 이벤트로 검색 요청
//   const handleSearch = async (e) => {
//     e.preventDefault();
//     const data = await getSearchUser(input);
//     setResult(data);
//   };

//   // 초대 버튼 클릭 시 처리하는 함수
//   const handleInvite = (user) => {
//     Swal.fire({
//       title: "초대 확인",
//       text: `${user.name}님을 초대하시겠습니까?`,
//       icon: "question",
//       showCancelButton: true,
//       confirmButtonText: "초대",
//       cancelButtonText: "취소",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         // 초대 API 호출 등 추가 구현 가능 (여기서는 단순 알림)
//         // const result = FriendRequest()
//         // if (result.status === 200) { }
//         Swal.fire({
//           title: "초대 완료",
//           text: `${user.name}를 그룹에 초대하였습니다.`,
//           icon: "success",
//           confirmButtonText: "확인",
//         });
//       }
//     });
//   };

//   return (
//     <div className="relative p-8 bg-white rounded-md shadow-xl max-w-3xl mx-auto mt-10">
//       {/* 헤더 영역 */}
//       <div className="mb-6 border-b pb-4">
//         <h2 className="text-3xl font-bold text-gray-800 mb-2">그룹 초대</h2>
//         <p className="text-gray-600">초대할 사용자를 검색하고 초대장을 발송하세요.</p>
//       </div>

//       {/* 검색 폼 */}
//       <form onSubmit={handleSearch} className="mb-6 flex flex-col sm:flex-row gap-4">
//         <input
//           type="text"
//           placeholder="사용자 검색..."
//           value={input}
//           onChange={handleInput}
//           className="flex-1 border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
//         />
//         <button
//           type="submit"
//           className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
//         >
//           {loading ? "검색 중..." : "검색"}
//         </button>
//       </form>

//       {/* 검색 결과 리스트 */}
//       <div className="mb-20">
//         <h3 className="text-2xl font-semibold text-gray-800 mb-4">검색 결과</h3>
//         {loading && <p className="text-gray-500">검색 중...</p>}
//         {!loading && result.length === 0 && (
//           <p className="text-gray-500">검색 결과가 없습니다.</p>
//         )}
//         <ul className="space-y-3">
//           {result.map((user) => (
//             <li
//               key={user.id}
//               className="flex items-center justify-between p-4 border border-gray-200 rounded-md hover:shadow-md transition-all duration-200"
//             >
//               <div>
//                 <p className="text-gray-700 font-medium">{user.name}</p>
//                 <p className="text-gray-500 text-sm">{user.email}</p>
//               </div>
//               <button
//                 onClick={() => handleInvite(user)}
//                 className="px-4 py-2 bg-green-500 text-white rounded-sm hover:bg-green-600 transition-colors duration-200 focus:outline-none"
//               >
//                 초대
//               </button>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default GroupInvite;
