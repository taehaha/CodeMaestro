import React, { useState, useEffect } from "react";
import styles from "./AvatarStack.module.css";

export interface UserPresence {
  user?: {
    name?: string;
    avatar?: string;
    color?: string;
  };
}

interface AvatarStackCollabProps {
  // y‑collab(WebsocketProvider)의 awareness 상태를 통해 얻은 사용자 정보 배열
  presences?: UserPresence[];
  provider?: any;
}

export function AvatarStackCollab({
  provider,
  presences: initialPresences,
}: AvatarStackCollabProps) {
  const [presences, setPresences] = useState<UserPresence[]>([]);

  useEffect(() => {
    if (provider) {
      const updatePresences = () => {
        // awareness에서 가져온 상태 배열
        const states = Array.from(provider.awareness.getStates().values()) as UserPresence[];
        // 사용자 정보가 없는 항목 필터링.
        const filteredStates = states.filter(
          (state) => state.user && state.user.name && state.user.name.trim() !== ""
        );
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
        // 유저 정보가 확실하다면 그대로 사용
        const userName = presence.user?.name || "익명";
        const userAvatar = presence.user?.avatar || "./img/user.png";
        return (
          <div key={index} className={styles.avatar} title={userName}>
            <img src={userAvatar} alt={userName} />
            <span className={styles.tooltip}>{userName}</span>
          </div>
        );
      })}
      {extraCount > 0 && <div className={styles.more}>+{extraCount}</div>}
    </div>
  );
}
