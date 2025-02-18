import { useState, useEffect } from "react";

const TagList = ({ rooms, selectTag }) => {
  const [populartags, setPopularTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]); // 선택된 태그를 상태로 관리

  // 태그 추가/제거 처리 함수 (토글 방식)
  const handleTagClick = (tag) => {
    setSelectedTags((prevSelectedTags) => {
      // 태그가 이미 선택된 상태이면 제거, 아니면 추가
      selectTag(tag);
      if (prevSelectedTags.includes(tag)) {
        return prevSelectedTags.filter((existingTag) => existingTag !== tag);
      } else {
        return [...prevSelectedTags, tag];
      }
    });
  };

  // 태그 추출 및 정렬
  useEffect(() => {
    const extractTags = () => {
      if (rooms.length === 0) {
        setPopularTags([]); // rooms가 빈 배열일 경우 태그 목록을 빈 배열로 설정
        return;
      }

      const tagCount = {}; // 태그의 등장 횟수를 저장할 객체

      // 방 목록을 순회하며 태그들 추출
      rooms.forEach((room) => {
        if (room.tagNameList && Array.isArray(room.tagNameList)) {
          room.tagNameList.forEach((tag) => {
            // 태그 등장 횟수 카운트
            tagCount[tag] = (tagCount[tag] || 0) + 1;
          });
        }
      });

      // 등장 횟수를 기준으로 태그를 내림차순으로 정렬
      const sortedTags = Object.entries(tagCount)
        .map(([tag, count]) => ({ tag, count })) // 객체 형태로 변환
        .sort((a, b) => b.count - a.count); // 내림차순으로 정렬

      // 최대 10개의 태그만 저장
      setPopularTags(sortedTags.length > 10 ? sortedTags.slice(0, 10) : sortedTags);
    };

    extractTags(); // 컴포넌트가 마운트될 때 태그 추출
  }, [rooms]); // 방 목록이 바뀔 때마다 태그를 다시 계산

  return (
    <div>
      <div className="flex flex-wrap gap-2 mt-1">
        {populartags.length > 0 ? (
          populartags.map((tag, index) => (
            <button
              key={index}
              onClick={() => handleTagClick(tag.tag)}
              className={`btn btn-sm btn-outline border-0 px-2 py-2 rounded-full text-sm font-semibold transition-all
                ${selectedTags.includes(tag.tag)
                  ? "bg-gray-800 text-white" // 선택된 태그는 어두운 배경
                  : "bg-transparent text-black hover:bg-gray-200" // 기본 상태
                }`}
            >
              # {tag.tag}
            </button>
          ))
        ) : (
          <p>스터디를 생성해 보세요!</p>
        )}
      </div>
    </div>
  );
};

export default TagList;
