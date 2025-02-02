const LoadAnimation = () => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-50 z-50">
      <div className="flex flex-col items-center">
        {/* 로딩 애니메이션 */}
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        
        {/* 로딩 텍스트 */}
        <p className="mt-4 text-lg font-medium text-gray-700">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default LoadAnimation;
