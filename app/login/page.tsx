"use client";

import React from "react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import PageContainer from "../components/PageContainer";
import styles from "../auth.module.scss";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  async function handleSabmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError("Пожалуйста, заполните все поля");
      return;
    }
    setLoading(true);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4500";
      // send identifier as both username and email so backend can match either
      const identifier = username;
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: identifier, email: identifier, password }),
      });
      const data = await res.json().catch(() => null);
      console.log("Статус ответа:", res.status);
      console.log("Объект ответа:", data);

      if (res.ok && data.success) {
        login(data.user, data.token);
        console.log("Успешный вход в систему", data);
        // Принудительно обновляем страницу для применения глобального состояния
        router.push("/");
        router.refresh(); // Добавляем обновление
      } else if (res.status === 400) {
        setError(data?.message ?? "Неверные учетные данные");
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
        <h1 className={styles.title}>Вход</h1>

        {error && (
          <div className={styles.error}>{error}</div>
        )}

        <form onSubmit={handleSabmit} aria-label="login form">
          <div className={styles.field}>
            <label htmlFor="username" className={styles.label}>Имя пользователя или почта</label>
            <input id="username" name="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className={styles.input} disabled={loading} placeholder="username или email" />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Пароль</label>
            <input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={styles.input} disabled={loading} />
          </div>

          <div style={{marginTop:12}}>
            <button type="submit" disabled={loading} className={`${styles.btn} ${loading ? styles.btnDisabled : styles.btnPrimary}`}>{loading ? 'Вход...' : 'Войти'}</button>
          </div>

          <div style={{textAlign:'center', marginTop:12, color:'var(--color-muted)'}}>
            Нет аккаунта? <Link href="../register" style={{color:'var(--color-primary)', fontWeight:700}}>Зарегистрироваться</Link>
          </div>
        </form>
        </div>
      </div>
    </PageContainer>
  );
}
