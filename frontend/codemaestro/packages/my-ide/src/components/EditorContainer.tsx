import React, { useState } from "react";
import Editor from "./Editor";
import { RoomProvider } from "@liveblocks/react";

interface EditorContainerProps {
  roomId: string;
}

const EditorContainer: React.FC<EditorContainerProps> = ({ roomId }) => {
  const [code, setCode] = useState<string>("");

  return (
    <RoomProvider id={`room-${roomId}`} initialPresence={{}}>
      <Editor 
        code={code}
        handleCodeChange={setCode}
        isDarkMode={false} 
        selectedLanguage={71} 
      />
    </RoomProvider>
  );
};

export default EditorContainer;
