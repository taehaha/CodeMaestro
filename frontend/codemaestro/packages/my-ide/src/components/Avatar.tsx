// /components/Avatar.tsx
import React from "react";
import styles from "./Avatar.module.css";

interface AvatarProps {
  src: string;
  name: string;
}

export function Avatar({ src, name }: AvatarProps) {
  return (
    <div className={styles.avatar} data-tooltip={name}>
      <img
        src={src}
        alt={name}
        width={48}
        height={48}
        className={styles.avatar_picture}
      />
    </div>
  );
}
