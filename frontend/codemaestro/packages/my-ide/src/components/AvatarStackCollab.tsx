import React, { useState, useEffect } from "react";
import styles from "./AvatarStack.module.css";

export interface UserPresence {
  user?: string | {
    name?: string;
    nickname?: string;
    avatar?: string;
    profileImageUrl?: string;
    color?: string;
    colorLight?: string;
  };
  myInfo?: string;
}

interface AvatarStackCollabProps {
  presences?: UserPresence[];
  provider?: any;
}

export function AvatarStackCollab({
  provider,
  presences: initialPresences,
}: AvatarStackCollabProps) {
  const [presences, setPresences] = useState<UserPresence[]>([]);
  const [showExtra, setShowExtra] = useState(false);

  // 문자열이면 JSON 파싱, 객체면 그대로 반환
  const parseData = (data?: string | { [key: string]: any }) => {
    if (!data) return {};
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch (err) {
        console.error("데이터 파싱 실패:", err);
        return {};
      }
    }
    return data;
  };

  // user와 myInfo 모두에서 데이터를 가져와서 병합합니다.
  const getUserData = (presence: UserPresence) => {
    const userData = presence.user ? parseData(presence.user) : {};
    const myInfoData = presence.myInfo ? parseData(presence.myInfo) : {};
    // myInfoData와 userData를 병합하는데, userData가 우선 적용되더라도 프로필 이미지가 없으면 myInfoData의 값을 사용할 수 있도록 합니다.
    return { ...myInfoData, ...userData };
  };

  useEffect(() => {
    if (provider) {
      const updatePresences = () => {
        const states = Array.from(provider.awareness.getStates().values()) as UserPresence[];
        const filteredStates = states.filter((state) => {
          const userData = getUserData(state);
          const name = userData?.name || userData?.nickname;
          return name && name.trim() !== "";
        });
        setPresences(filteredStates);
        console.log("업데이트된 presence:", filteredStates);
      };
      updatePresences();
      provider.awareness.on("change", updatePresences);
      return () => {
        provider.awareness.off("change", updatePresences);
      };
    } else if (initialPresences) {
      setPresences(initialPresences);
    }
  }, [provider, initialPresences]);

  const maxDisplay = 5;
  const displayedPresences = presences.slice(0, maxDisplay);
  const extraCount = presences.length > maxDisplay ? presences.length - maxDisplay : 0;

  return (
    <div className={styles.avatarStack}>
      {displayedPresences.map((presence, index) => {
        const userData = getUserData(presence);
        console.log("User Data:", userData);
        const userName = userData?.name || userData?.nickname || "익명";
        // avatar가 있으면 우선 사용, 없으면 profileImageUrl, 둘 다 없으면 기본 이미지 사용
        const userAvatar = userData?.avatar || userData?.profileImageUrl || "./img/user.png";
        return (
          <div key={index} className={styles.avatar} title={userName}>
            <img src={userAvatar} alt={userName} />
            <span className={styles.tooltip}>{userName}</span>
          </div>
        );
      })}
      {presences.length > maxDisplay && (
        <div 
          className={styles.moreContainer} 
          onMouseEnter={() => setShowExtra(true)}
          onMouseLeave={() => setShowExtra(false)}
        >
          <div className={styles.more}>
            +{extraCount}
          </div>
          {showExtra && (
            <div className={styles.extraTooltip}>
              {presences.slice(maxDisplay).map((presence, idx) => {
                const userData = getUserData(presence);
                const userName = userData?.name || userData?.nickname || "익명";
                return (
                  <div key={idx} className={styles.extraListItem}>
                    {userName}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
