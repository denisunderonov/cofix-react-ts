"use client"
import React from "react";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext"; // Исправляем путь к контексту

const UNAUTH_NAV = [
  { href: "/news", label: "НОВОСТИ" },
  { href: "/reviews", label: "ОТЗЫВЫ" },
  { href: "/about", label: "О САЙТЕ" },
  { href: "/galery", label: "ГАЛЕРЕЯ" },
  { href: "/login", label: "ВОЙТИ" },
];

const AUTH_NAV = [
  { href: "/news", label: "НОВОСТИ" },
  { href: "/reviews", label: "ОТЗЫВЫ" },
  { href: "/about", label: "О САЙТЕ" },
  { href: "/galery", label: "ГАЛЕРЕЯ" },
  { href: "/profile", label: "ПРОФИЛЬ" },
];

export default function Header() {
  const { isAuthenticated, user, loading, logout } = useAuth();

  const handleLogout = () => {
    logout();
    // Можно добавить редирект на главную страницу
    window.location.href = "/";
  };

  // Показываем заглушку во время загрузки
  if (loading) {
    return (
      <header className="bg-black shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-white">Cofix на Курской</Link>
          <nav className="space-x-4">
            <div className="text-white animate-pulse">Загрузка...</div>
          </nav>
        </div>
      </header>
    );
  }

  const navItems = isAuthenticated ? AUTH_NAV : UNAUTH_NAV;

  return (
    <header className="bg-black shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-white">Cofix на Курской</Link>
        
        <div className="flex items-center space-x-6">
          {/* Основная навигация */}
          <nav className="space-x-4">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                className="text-white font-bold text-xl hover:underline transition duration-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Блок пользователя (только для авторизованных) */}
          {isAuthenticated && user && (
            <div className="flex items-center space-x-4 border-l border-gray-600 pl-4">
              
            </div>
          )}
        </div>
      </div>
    </header>
  );
}