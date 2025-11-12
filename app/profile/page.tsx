"use client";
import { useAuth } from "../hooks/useAuth"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProfilePage() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Перенаправление...</p>
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
            className="text-black hover:text-black-800 transition-colors font-bold text-xl"
          >
            Главная
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600 font-bold text-xl">Профиль</span>
        </nav>

        <div className="bg-white shadow-xl overflow-hidden">
          {/* Заголовок профиля */}
          <div className="bg-black p-8 text-white">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{user?.username}</h1>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="bg-white px-3 py-1 rounded-full text-black font-bold text-xl backdrop-blur-sm">
                    {user?.role === 'admin' ? 'Работник кофейни' : 'Гость'}
                  </span>
                  <span className="bg-white text-black px-3 py-1 rounded-full font-bold text-xl backdrop-blur-sm">
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
                { id: 'profile', label: ' Профиль', icon: '' },
                { id: 'settings', label: ' Настройки', icon: '' },
                { id: 'reviews', label: ' Отзывы', icon: '' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 font-bold text-xl border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-black-500 text-black-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Контент вкладок */}
          <div className="p-8">
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="font-bold text-xl text-gray-900">Основная информация</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-bold text-xl text-gray-500">Имя пользователя</p>
                        <p className="font-bold text-xl">{user?.username}</p>
                      </div>
                      <span className="text-blue-600">✏️</span>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-bold text-xl text-gray-500">Email</p>
                        <p className="font-bold text-xl">{user?.email}</p>
                      </div>
                      <span className="text-blue-600">✏️</span>
                    </div>
                  </div>
                </div>

                  {/* Быстрые действия */}
                  <div className="bg-white p-6 rounded-lg">
                    <h4 className="font-bold text-xl text-black mb-4">Быстрые действия</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <button className="bg-black text-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow font-bold text-xl">
                        Написать отзыв
                      </button>
                    </div>
                  </div>
                </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">Настройки аккаунта</h3>
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium mb-2">Уведомления</h4>
                    <p className="text-sm text-gray-600 mb-3">Настройте получение уведомлений</p>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                        <span className="text-sm">Email уведомления</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                        <span className="text-sm">Уведомления о заказах</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 pt-8">
              <button
                onClick={logout}
                className="w-full md:w-auto bg-black text-white font-medium py-3 px-8 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <span className="font-bold text-xl">Выйти</span>
              </button>
            </div>
          </div>
        </div>        
      </div>
    </div>
  );
}