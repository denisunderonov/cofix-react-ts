'use client';

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Email и пароль обязательны");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:4500/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await res.json().catch(() => null);

      if (res.status === 201 || res.ok) {
        console.log("Аккаунт успешно зарегистрирован", data);
        router.push("/login");
      } else if (res.status === 409) {
        setError(data?.error?.message ?? "Email уже занят");
      } else if (res.status === 400) {
        setError(data?.error?.message ?? "Неправильные данные");
      } else {
        setError(data?.error?.message ?? `Ошибка ${res.status}`);
      }
    } catch (err: any) {
      setError(err?.message ?? "Сетевая ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 text-black">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 text-black">
        <h1 className="text-2xl font-semibold mb-2 text-black">Регистрация</h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          aria-label="login form"
        >
          <div>
            <label htmlFor="username" className="block text-sm font-medium">
              Имя пользователя
            </label>
            <input
              id="username"
              name="username"
              type="username"
              className="mt-1 block w-full border rounded px-3 py-2 border-slate-200"
            />
            <p id="username-error" className="mt-1 text-sm text-red-600 hidden">
              {}
            </p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Почта
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="mt-1 block w-full border rounded px-3 py-2 border-slate-200"
            />
            <p id="email-error" className="mt-1 text-sm text-red-600 hidden">
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
          </div>

          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              Зарегистрироваться
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
