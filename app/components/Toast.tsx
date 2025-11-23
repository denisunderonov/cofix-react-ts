"use client";

import React, { useEffect } from 'react';
import styles from './Toast.module.scss';

type Props = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose?: () => void;
  duration?: number; // ms
  type?: 'success' | 'error' | 'info';
};

export default function Toast({ message, actionLabel, onAction, onClose, duration = 4000, type = 'info' }: Props) {
  useEffect(() => {
    const t = window.setTimeout(() => { if (onClose) onClose(); }, duration);
    return () => window.clearTimeout(t);
  }, [duration, onClose]);

  return (
    <div className={`${styles.toast} ${type === 'success' ? styles.success : type === 'error' ? styles.error : ''}`} role="status" aria-live="polite">
      <div className={styles.message}>{message}</div>
      {actionLabel && onAction && <button className={styles.action} onClick={onAction}>{actionLabel}</button>}
    </div>
  );
}
