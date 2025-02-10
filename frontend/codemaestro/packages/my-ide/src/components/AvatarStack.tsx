// /components/AvatarStack.tsx
import React from "react";
import { useOthers, useSelf } from "@liveblocks/react";
import { Avatar } from "./Avatar"; // 기존에 만든 Avatar 컴포넌트 사용
import styles from "./AvatarStack.module.css";

export function AvatarStack() {
  const others = useOthers();
  const self = useSelf();
  const maxDisplay = 5;
  const displayedUsers = others.slice(0, maxDisplay);
  const extraCount = others.length > maxDisplay ? others.length - maxDisplay : 0;

  return (
    <div className={styles.avatarStack}>
      {displayedUsers.map(({ connectionId, info }) => (
        <Avatar
          key={connectionId}
          name={info?.name ?? "User"}
          src={info?.avatar ?? "./img/user.png"}
        />
      ))}
      {extraCount > 0 && <div className={styles.more}>+{extraCount}</div>}
      {self && (
        <div className={styles.selfAvatar}>
          <Avatar
            // 프로필에서 설정한 닉네임 사용 (없으면 기본값 "Guest")
            name={self.info?.name ?? "Guest"}
            src={self.info?.avatar ?? "./img/user.png"}
          />
        </div>
      )}
    </div>
  );
}
