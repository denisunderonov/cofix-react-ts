"use client"
import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";
import styles from "./Header.module.scss";

const UNAUTH_NAV = [
  { href: "/news", label: "Новости" },
  { href: "/menu", label: "Меню" },
  { href: "/login", label: "Профиль" }
];

const AUTH_NAV = [
  { href: "/news", label: "Новости" },
  { href: "/menu", label: "Меню" },
  { href: "/profile", label: "Профиль" },
];

export default function Header() {
  const { isAuthenticated, user, loading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Закрытие меню по Escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        closeMobileMenu();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  // Блокировка прокрутки body когда меню открыто
  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  if (loading) {
    return (
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand}>Cofix на Курской</Link>
          <nav className={styles.nav}>
            <div className={styles.loadingPulse}>Загрузка...</div>
          </nav>
        </div>
      </header>
    );
  }

  const navItems = isAuthenticated ? AUTH_NAV : UNAUTH_NAV;

  // Extend navigation depending on role
  const extendedNav = [...navItems];
  const role = user?.role || (isAuthenticated ? 'guest' : 'guest');
  // Schedule is available to all authenticated roles except guest
  if (isAuthenticated && ['worker', 'manager', 'creator'].includes(role)) {
    extendedNav.push({ href: '/schedule', label: 'График' });
  }
  // Creator gets admin links
  if (isAuthenticated && role === 'creator') {
    extendedNav.push({ href: '/admin/users', label: 'Пользователи' });
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand}>Cofix на Курской</Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Основная навигация (скрыта на мобильных) */}
            <nav className={styles.nav}>
              {extendedNav.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={styles.navLink}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Переключатель темы */}
            <ThemeToggle />

            {/* Блок пользователя (только для авторизованных) */}
            {isAuthenticated && user && (
              <div className={styles.userBlock}>
                {/* future user avatar/name/logout */}
              </div>
            )}

            {/* Бургер-кнопка (видна только на мобильных) */}
            <button 
              className={`${styles.burgerBtn} ${isMobileMenuOpen ? styles.burgerBtnOpen : ''}`}
              onClick={toggleMobileMenu}
              aria-label="Меню"
            >
              <span className={styles.burgerLine}></span>
              <span className={styles.burgerLine}></span>
              <span className={styles.burgerLine}></span>
            </button>
          </div>
        </div>
      </header>

      {/* Мобильное меню */}
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <nav className={styles.mobileNav}>
          {extendedNav.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className={styles.mobileNavLink}
              onClick={closeMobileMenu}
            >
              {item.label}
            </Link>
          ))}
          
          {/* Переключатель темы в мобильном меню */}
          <div className={styles.mobileThemeToggle}>
            <span className={styles.mobileThemeLabel}>Тема</span>
            <ThemeToggle />
          </div>
        </nav>
      </div>

      {/* Оверлей (затемнение фона) */}
      {isMobileMenuOpen && (
        <div 
          className={styles.overlay} 
          onClick={closeMobileMenu}
        />
      )}
    </>
  );
}