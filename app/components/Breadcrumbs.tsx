"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const labels: Record<string, string> = {
  "": "Главная",
  news: "Новости",
  menu: "Меню",
  galery: "Фотографии",
  profile: "Профиль",
  login: "Вход",
  register: "Регистрация",
};

function niceLabel(segment: string) {
  if (!segment) return labels[""];
  if (labels[segment]) return labels[segment];
  // numeric id or uuid -> Детали
  if (/^[0-9]+$/.test(segment) || /[0-9a-fA-F\-]{8,}/.test(segment)) return "Детали";
  // fallback: capitalize
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

export default function Breadcrumbs() {
  const pathname = usePathname() || "/";
  const parts = pathname.split("/").filter(Boolean);

  const crumbs = [{ href: "/", label: labels[""] }];
  let acc = "";
  parts.forEach((p) => {
    acc += `/${p}`;
    crumbs.push({ href: acc, label: niceLabel(p) });
  });

  return (
    <nav className="page-breadcrumbs" aria-label="breadcrumbs">
      {crumbs.map((c, i) => (
        <span key={c.href} className="crumb">
          {i !== 0 && <span className="sep">/</span>}
          {i < crumbs.length - 1 ? (
            <Link href={c.href} className="crumb-link">{c.label}</Link>
          ) : (
            <span className="crumb-current">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
