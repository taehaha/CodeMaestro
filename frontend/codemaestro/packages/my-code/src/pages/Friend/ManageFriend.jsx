import Swal from "sweetalert2";
import { deleteFriend } from "../../api/FriendApi";

const ManageFriend = ({ openAddFriendPage, checkedUsers }) => {
  const handleDelete = async () => {
    if (!checkedUsers.length) {
      Swal.fire({
        title: "선택된 유저가 존재하지 않습니다.",
        icon: "warning",
      });
      return;
    }

    // 삭제 확인 다이얼로그 표시
    const result = await Swal.fire({
      title: "친구 삭제를 진행하시겠습니까?",
      text: "이 작업은 되돌릴 수 없습니다.",
      showCancelButton: true,
      confirmButtonText: "확인",
      cancelButtonText: "취소",
      cancelButtonColor: "#B0BEC5",
    });

    if (result.isConfirmed) {
      try {
        // 선택된 모든 친구에 대해 삭제 API 호출
        await Promise.all(
          checkedUsers.map((user) => deleteFriend(user.requestId))
        );

        Swal.fire({
          title: "삭제 완료",
          text: "친구 삭제가 완료되었습니다.",
          icon: "success",
        });

        // 필요에 따라 checkedUsers를 초기화하거나, 친구 목록을 새로 고침하는 로직 추가
      } catch (error) {
        console.error("친구 삭제 실패:", error);
        Swal.fire({
          title: "삭제 실패",
          text: "친구 삭제에 실패했습니다. 다시 시도해주세요.",
          icon: "error",
        });
      }
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-full">
      <button
        className="btn rounded-full w-40 mb-3 bg-primary text-white"
        onClick={openAddFriendPage}
      >
        새로운 친구 추가
      </button>
      <button
        className="btn rounded-full w-40 mb-3 bg-error text-white"
        onClick={handleDelete}
      >
        친구 삭제
      </button>
      <button className="btn rounded-full w-40 mb-3">Solved.ac 연동중</button>
    </div>
  );
};

export default ManageFriend;
