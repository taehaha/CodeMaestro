/* eslint-disable import/first */
// 인풋 레이아웃을 app.tsx에서 분리한 것임. 인풋칸 관련 파일일
export {};

import React from "react";
import { Copy } from "lucide-react";

interface InputAreaProps {
  input: string;
  setInput: (value: string) => void;
}

const InputArea: React.FC<InputAreaProps> = ({ input, setInput }) => {
  return (
    <div className="bg-gray-200 dark:bg-gray-900 border border-gray-400 dark:border-gray-800 rounded p-4 transition-colors duration-500">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-black dark:text-white">Input:</h2>
        <button
          onClick={() => navigator.clipboard.writeText(input)}
          className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="입력하시오..."
        className="w-full h-[200px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-black dark:text-white p-2 outline-none transition-colors duration-500"
      />
    </div>
  );
};

export default InputArea;
