"use client"
import React from "react";
import Link from "next/link";

const NAV = [
  { href: "/reviews", label: "Отзывы" },
  { href: "/about", label: "О сайте" },
  { href: "/galery", label: "Галерея" },
  { href: "/login", label: "Войти" },
];

export default function Header() {
  return (
    <header className="bg-black shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-white">CofixKurskaya</Link>
        <nav className="space-x-4">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-white hover:underline">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
