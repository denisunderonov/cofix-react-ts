"use client";
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProfilePage() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Перенаправление...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Хлебные крошки */}
        <nav className="mb-8">
          <Link
            href="/"
            className="text-amber-700 hover:text-amber-800 transition-colors font-medium"
          >
            Главная
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600 font-medium">Профиль</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          {/* Заголовок профиля */}
          <div className="bg-black p-8 text-white">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{user?.username}</h1>
                <div className="flex items-center space-x-3 mt-3">
                  <span className="bg-white/20 px-4 py-2 rounded-full font-semibold text-sm backdrop-blur-sm">
                    {user?.role === "admin" ? "Работник кофейни" : "Гость"}
                  </span>
                  <span className="bg-green-500/20 px-4 py-2 rounded-full font-semibold text-sm backdrop-blur-sm">
                    Активен
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Навигация по вкладкам */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {[
                { id: "profile", label: "Профиль" },
                { id: "settings", label: "Настройки" },
                { id: "reviews", label: "Отзывы" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 font-medium border-b-2 transition-all ${
                    activeTab === tab.id
                      ? "border-amber-500 text-amber-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Контент вкладок */}
          <div className="p-8">
            {activeTab === "profile" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Основная информация
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          Имя пользователя
                        </p>
                        <p className="text-gray-900 font-semibold">
                          {user?.username}
                        </p>
                      </div>
                      <span className="text-amber-600 hover:text-amber-700 cursor-pointer">
                        ✏️
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          Email
                        </p>
                        <p className="text-gray-900 font-semibold">
                          {user?.email}
                        </p>
                      </div>
                      <span className="text-amber-600 hover:text-amber-700 cursor-pointer">
                        ✏️
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Настройки аккаунта
                </h3>
                <div className="space-y-4">
                  <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Уведомления
                    </h4>
                    <p className="text-gray-600 mb-4 font-medium">
                      Настройте получение уведомлений
                    </p>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="rounded text-amber-600 focus:ring-amber-500"
                          defaultChecked
                        />
                        <span className="text-gray-700 font-medium">
                          Email уведомления
                        </span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="rounded text-amber-600 focus:ring-amber-500"
                          defaultChecked
                        />
                        <span className="text-gray-700 font-medium">
                          Уведомления о заказах
                        </span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="rounded text-amber-600 focus:ring-amber-500"
                          defaultChecked
                        />
                        <span className="text-gray-700 font-medium">
                          Специальные предложения
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Мои отзывы
                </h3>
                <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 text-center">
                  <p className="text-gray-600 font-medium">
                    У вас пока нет отзывов. Поделитесь своим мнением о наших
                    напитках!
                  </p>
                </div>
              </div>
            )}

            {/* Кнопка выхода */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <button
                onClick={logout}
                className="w-full md:w-auto bg-black hover:bg-amber-600 text-white font-medium py-3 px-8 rounded-lg transition-colors"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
