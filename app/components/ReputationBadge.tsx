"use client"
import React, { useState } from "react";
import styles from "./ReputationBadge.module.scss";

interface ReputationBadgeProps {
  reputation: number;
  size?: "small" | "medium";
}

export default function ReputationBadge({ reputation, size = "small" }: ReputationBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className={`${styles.badge} ${styles[size]}`}
      onClick={() => setShowTooltip(!showTooltip)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className={styles.icon}>☕</span>
      <span className={styles.value}>{reputation}</span>
      
      {showTooltip && (
        <div className={styles.tooltip}>
          <div className={styles.tooltipTitle}>Репутация</div>
          <div className={styles.tooltipText}>
            Репутация показывает активность и вклад пользователя в сообщество. 
            Другие пользователи могут повышать вашу репутацию.
          </div>
        </div>
      )}
    </div>
  );
}
