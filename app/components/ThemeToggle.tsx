"use client"

import React from 'react'
import { useTheme } from '../contexts/ThemeContext'
import styles from './ThemeToggle.module.scss'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button 
      className={styles.toggleBtn}
      onClick={toggleTheme}
      aria-label={`Переключить на ${theme === 'light' ? 'тёмную' : 'светлую'} тему`}
      title={`Переключить на ${theme === 'light' ? 'тёмную' : 'светлую'} тему`}
    >
      <div className={`${styles.toggleTrack} ${theme === 'dark' ? styles.toggleTrackDark : ''}`}>
        <div className={`${styles.toggleThumb} ${theme === 'dark' ? styles.toggleThumbDark : ''}`}>
          <span className={styles.toggleIcon}>
            {theme === 'light' ? '☀️' : '🌙'}
          </span>
        </div>
      </div>
    </button>
  )
}
