import React from "react";
import styles from "./Avatar.module.css";

interface AvatarProps {
  src: string;
  name: string;
}

export function Avatar({ src, name }: AvatarProps) {
  return (
    <div className={`${styles.avatar} group`}>
      <img src={src} alt={name} className={styles.avatar_picture} />
      <span className={styles.tooltip}>{name}</span>
    </div>
  );
}
