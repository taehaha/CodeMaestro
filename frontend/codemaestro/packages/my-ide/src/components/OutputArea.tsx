/* eslint-disable import/first */
// 아웃풋 레이아웃을 app.tsx에서 분리한 것임.
export {};

import React from "react";
import { Copy } from "lucide-react";

interface OutputAreaProps {
  output: string;
  isLoading: boolean;
  execTime?: number | null;   // ms 실행시간
  execMemory?: number | null; // kb 메모리 용량
}

const OutputArea: React.FC<OutputAreaProps> = ({
  output,
  isLoading,
  execTime,
  execMemory,
}) => {
  return (
    <div className="bg-gray-200 dark:bg-gray-900 border border-gray-400 dark:border-gray-800 rounded p-4 transition-colors duration-500">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-black dark:text-white">Output:</h2>
        <button
          onClick={() => navigator.clipboard.writeText(output)}
          className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>

      {/* 실행 시간, 메모리 표시 */}
      {(execTime != null || execMemory != null) && (
        <div className="mb-2 text-sm text-gray-700 dark:text-gray-200">
          {execTime != null && (
            <div>
              <strong>실행 속도:</strong> {execTime.toFixed(2)} ms
            </div>
          )}
          {execMemory != null && (
            <div>
              <strong>메모리 사용량:</strong> {execMemory} KB
            </div>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 h-[200px] p-2 rounded text-sm font-mono overflow-auto text-black dark:text-white transition-colors duration-500">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            Running...
          </div>
        ) : (
          <pre className="whitespace-pre-wrap">{output}</pre>
        )}
      </div>
    </div>
  );
};

export default OutputArea;
