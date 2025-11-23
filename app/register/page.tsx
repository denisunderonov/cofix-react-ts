"use client";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PageContainer from "../components/PageContainer";
import styles from "../auth.module.scss";
import { useAuth } from "@/app/contexts/AuthContext";

export default function RegisterForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password || !username) {
      setError("Пожалуйста, заполните все поля");
      return;
    }

    setLoading(true);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4500";
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await res.json().catch(() => null);

      console.log("Статус ответа:", res.status);
      console.log("Объект ответа:", data);

      if (res.status === 201 || res.ok) {
        console.log("Аккаунт успешно зарегистрирован", data);
        // If server returned token + user, auto-login and navigate home
        if (data?.token && data?.user) {
          try {
            login(data.user, data.token);
          } catch (e) {
            console.warn('Auto-login failed:', e);
          }
        }
        router.push("/");
        router.refresh();
      } else if (res.status === 400) {
        setError(data?.message ?? "Пользователь с таким email уже существует");
      } else {
        setError(data?.message ?? `Ошибка ${res.status}`);
      }
    } catch (err: any) {
      console.error("Ошибка fetchа:", err);
      setError(err?.message ?? "Сетевая ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer>
      <div className={styles.authWrap}>
        <div className={styles.card}>
        <h1 className={styles.title}>Регистрация</h1>
        {error && (
          <div className={styles.error}>{error}</div>
        )}

        <form onSubmit={handleSubmit} aria-label="registration form">
          <div className={styles.field}>
            <label htmlFor="username" className={styles.label}>Имя пользователя</label>
            <input id="username" name="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className={styles.input} disabled={loading} />
          </div>

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Почта</label>
            <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={styles.input} disabled={loading} />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Пароль</label>
            <input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={styles.input} disabled={loading} />
          </div>

          <div>
            <button type="submit" disabled={loading} className={`${styles.btn} ${loading ? styles.btnDisabled : styles.btnPrimary}`}>{loading ? 'Регистрация...' : 'Зарегистрироваться'}</button>
          </div>
        </form>
        </div>
      </div>
    </PageContainer>
  );
}
