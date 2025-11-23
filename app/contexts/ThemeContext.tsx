"use client"

import React, { createContext, useState, useContext, useEffect } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Загружаем сохраненную тему из localStorage
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.setAttribute('data-theme', savedTheme)
    } else {
      // Проверяем системные настройки
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const initialTheme = prefersDark ? 'dark' : 'light'
      setTheme(initialTheme)
      document.documentElement.setAttribute('data-theme', initialTheme)
    }
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  // Не рендерим контент до монтирования, чтобы избежать мерцания
  if (!mounted) {
    return null
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
