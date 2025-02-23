import { Subscriber } from "openvidu-browser";
import React from "react";
import { ConnectionData, OpenviduClient } from "../OpenviduClient";
import { Crown, MicOff, MonitorOff, UserX, X } from "lucide-react";

/**
 * props 예시:
 * - isOpen: 모달 열림/닫힘 상태 (boolean)
 * - onClose: 모달 닫기 핸들러 (함수)
 * - participants: 참가자 목록 (예: [{ id: 1, name: "홍길동" }, ...])
 * - onKick: 강퇴 함수 (participantId) => void
 * - onDisableWebcam: 웹캠 끄기 함수 (participantId) => void
 * - onDisableMic: 마이크 끄기 함수 (participantId) => void
 * - onTransferHost: 방장 넘기기 함수 (participantId) => void
 */

interface ManageModalComponentProps {
  ovClient: OpenviduClient,
  isOpen: Boolean;
  onClose: () => void;
  connectionDatas: ConnectionData[];
}

const ManageModalComponent: React.FC<ManageModalComponentProps> = ({
  ovClient,
  isOpen,
  onClose,
  connectionDatas
}) => {
  // 모달이 닫혀있다면 렌더링하지 않음
  if (!isOpen) return null;

  return (
    // 모달 배경 (어두운 오버레이)
    // 오버레이: 전체 화면을 덮는 반투명 배경
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* 모달 박스 */}
      <div className="bg-white w-11/12 max-w-2xl rounded-lg shadow-lg p-4 relative">
        {/* 모달 헤더 */}
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-xl font-semibold text-gray-800">스터디룸 관리</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* 모달 바디: 참가자 목록 */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {connectionDatas.length === 0 ? (
            <p className="text-gray-500 text-center py-4">참가자가 없습니다.</p>
          ) : (
            connectionDatas.map((connectionData) => (
              <div
                key={connectionData.userId}
                className="flex items-center justify-between bg-gray-100 rounded-md p-3"
              >
                <div>
                  <p className="text-gray-800 font-medium">
                    {connectionData.nickname}
                  </p>
                  <p className="text-xs text-gray-500">ID: {connectionData.userId}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => ovClient.manageKickParticipant(connectionData.userId)}
                    className="flex items-center bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded-md space-x-1"
                  >
                    <UserX size={16} />
                    <span>강퇴</span>
                  </button>
                  <button
                    onClick={() => ovClient.manageParticipantVideoOff(connectionData.userId)}
                    className="flex items-center bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded-md space-x-1"
                  >
                    <MonitorOff size={16} />
                    <span>화면 끄기/켜기</span>
                  </button>
                  <button
                    onClick={() => ovClient.manageParticipantAudioOff(connectionData.userId)}
                    className="flex items-center bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded-md space-x-1"
                  >
                    <MicOff size={16} />
                    <span>마이크 끄기</span>
                  </button>
                  <button
                    onClick={() => ovClient.manageChangeModerator(connectionData.userId)}
                    className="flex items-center bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded-md space-x-1"
                  >
                    <Crown size={16} />
                    <span>방장 넘기기</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 모달 하단: 닫기 버튼 */}
        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageModalComponent;
