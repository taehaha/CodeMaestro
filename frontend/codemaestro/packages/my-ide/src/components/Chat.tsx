// src/components/Video.tsx
import React from "react";
import OpenBidooComponent from "./OpenBidooComponent";

interface ChatProps {
  streamManager: any;
}

const Chat: React.FC<ChatProps> = ({ streamManager }) => {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-2 border-b border-gray-300 dark:border-gray-700">
        <h2 className="font-bold mb-1">OpenBidoo Video Stream</h2>
      </div>
      <div className="flex-grow overflow-auto p-4">
        <OpenBidooComponent streamManager={streamManager} />
      </div>
    </div>
  );
};

export default Chat;
