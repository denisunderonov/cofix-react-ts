"use client";

import React from "react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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

      if (data.token) {
        localStorage.setItem('authToken', data.token);
        console.log('Токен сохранен:', data.token);
      }
      
      if (data.user) {
        localStorage.setItem('userData', JSON.stringify(data.user));
      }

      if (res.status === 200 || res.ok) {
        console.log("Успешный вход в систему", data);
        router.push("/");
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

        <form
          className="space-y-4"
          aria-label="login form"
          onSubmit={handleSabmit}
        >
          <div>
            <label htmlFor="username" className="block text-sm font-medium">
              Имя пользователя
            </label>
            <input
              id="username"
              name="username"
              type="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2 border-slate-200"
            />
            <p id="username-error" className="mt-1 text-sm text-red-600 hidden">
              {}
            </p>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Пароль
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2 border-slate-200"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-500"
              >
                Показать
              </button>
            </div>
            <p id="password-error" className="mt-1 text-sm text-red-600 hidden">
              {}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="remember" className="h-4 w-4" />
              <span>Запомнить меня</span>
            </label>

            <a
              href="/forgot"
              className="text-sm text-amber-600 hover:underline"
            >
              Забыли пароль?
            </a>
          </div>

          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              Войти
            </button>
          </div>

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
