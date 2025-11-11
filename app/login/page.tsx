"use client";

import React from "react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";

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
      const res = await fetch("http://localhost:4500/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 text-black">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 text-black">
        <h1 className="text-2xl font-semibold mb-2 text-black">Вход</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form
          className="space-y-4"
          aria-label="login form"
          onSubmit={handleSabmit}
        >
          {/* Остальная форма без изменений */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium">
              Имя пользователя
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2 border-slate-200"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2 border-slate-200"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:bg-gray-400"
          >
            {loading ? "Вход..." : "Войти"}
          </button>

          <div className="text-center text-sm text-slate-500">
            Нет аккаунта?{" "}
            <Link href="../register" className="text-amber-600 hover:underline">
              Зарегистрироваться
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
