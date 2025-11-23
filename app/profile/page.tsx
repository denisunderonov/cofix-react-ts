"use client";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import PageContainer from "../components/PageContainer";
import ReputationBadge from "../components/ReputationBadge";
import styles from "./Profile.module.scss";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';

export default function ProfilePage() {
  const { isAuthenticated, user, logout, setUser, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Ждём завершения загрузки перед редиректом
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      console.log('Token from localStorage:', token ? token.substring(0, 20) + '...' : 'missing');
      console.log('User from context:', user);
      console.log('isAuthenticated:', isAuthenticated);
      
      if (!token) {
        alert('Токен авторизации не найден. Войдите снова.');
        router.push('/login');
        return;
      }

      const res = await fetch(`${API_BASE}/api/user/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);

      if (data.success && data.user) {
        // Update user context with new avatar
        const updatedUser = { ...user, avatar: data.user.avatar };
        setUser(updatedUser as any);
        // Update localStorage
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        alert('Аватар загружен успешно!');
      } else {
        alert(data.error || 'Ошибка загрузки аватара');
      }
    } catch (error) {
      console.error('Ошибка загрузки аватара:', error);
      alert('Ошибка загрузки аватара');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!confirm('Вы уверены, что хотите удалить аватар?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/api/user/avatar`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });

      const data = await res.json();
      if (data.success) {
        setUser({ ...user, avatar: null } as any);
        alert('Аватар удалён');
      } else {
        alert(data.error || 'Ошибка удаления аватара');
      }
    } catch (error) {
      console.error('Ошибка удаления аватара:', error);
      alert('Ошибка удаления аватара');
    }
  };

  // Показываем загрузку пока проверяется авторизация
  if (loading) {
    return (
      <div className={styles.centered}>
        <div className={styles.centerText}>
          <div className={styles.spinner}></div>
          <p className={styles.mutedText}>Загрузка...</p>
        </div>
      </div>
    );
  }

  // Если не авторизован после загрузки - показываем перенаправление
  if (!isAuthenticated) {
    return (
      <div className={styles.centered}>
        <div className={styles.centerText}>
          <div className={styles.spinner}></div>
          <p className={styles.mutedText}>Перенаправление...</p>
        </div>
      </div>
    );
  }

  return (
    <PageContainer>
      <div className={styles.page}>
        <div className={styles.container}>

        <div className={styles.card}>
          {/* Заголовок профиля */}
          <div className={styles.header}>
            <div className={styles.headerInner}>
              <div className={styles.avatarSection}>
                <div 
                  className={styles.avatarWrapper}
                  onClick={() => fileInputRef.current?.click()}
                  style={{ cursor: uploading ? 'wait' : 'pointer' }}
                  title="Кликните для загрузки нового фото"
                >
                  {user?.avatar ? (
                    <img src={`${API_BASE}${user.avatar}`} alt="Avatar" className={styles.avatar} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className={styles.avatarOverlay}>
                    {uploading ? '⏳' : '📷'}
                  </div>
                </div>
                {user?.avatar && (
                  <button 
                    onClick={handleDeleteAvatar} 
                    className={styles.deleteAvatarBtn}
                    title="Удалить аватар"
                  >
                    Удалить фото
                  </button>
                )}
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  style={{ display: 'none' }}
                />
              </div>
              <div>
                <h1 className={styles.username}>{user?.username}</h1>
                <div className={styles.statusWrap}>
                  <span className={styles.badge}>{(() => {
                    const r = user?.role || 'guest';
                    switch (r) {
                      case 'worker': return 'Бариста';
                      case 'manager': return 'Управляющий кофейни';
                      case 'creator': return 'Создатель';
                      case 'admin': return 'Админ';
                      default: return 'Гость';
                    }
                  })()}</span>
                  <ReputationBadge reputation={user?.reputation || 0} size="medium" />
                  <span className={`${styles.badge} ${styles.activeBadge}`}>Активен</span>
                </div>
              </div>
            </div>
          </div>

          {/* Навигация по вкладкам */}
          <div className={styles.tabs}>
            <nav className={styles.tabsNav}>
              {[{ id: "profile", label: "Профиль" }, { id: "settings", label: "Настройки" }].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabActive : styles.tabInactive}`}
                  style={{
                    background: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-dark)',
                    color: activeTab === tab.id ? 'var(--color-on-primary)' : 'var(--color-on-dark)'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Контент вкладок */}
          <div className={styles.content}>
            {activeTab === "profile" && (
              <div className={styles.grid}>
                <div className={styles.panel}>
                  <h3 className={styles.username}>Основная информация</h3>

                  <div style={{ marginTop: 12 }}>
                    <div className={styles.panel} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div className={styles.label}>Имя пользователя</div>
                        <div className={styles.value}>{user?.username}</div>
                      </div>
                      <span style={{ color: 'var(--color-primary)', cursor: 'pointer' }}>✏️</span>
                    </div>

                    <div style={{ height: 12 }} />

                    <div className={styles.panel} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div className={styles.label}>Email</div>
                        <div className={styles.value}>{user?.email}</div>
                      </div>
                      <span style={{ color: 'var(--color-primary)', cursor: 'pointer' }}>✏️</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className={styles.sectionList}>
                <h3 className={styles.sectionTitle}>Настройки аккаунта</h3>
                <div className={styles.sectionList}>
                  <div className={styles.notificationCard}>
                    <h4 className={styles.sectionTitle} style={{ marginBottom: 12 }}>
                      Уведомления
                    </h4>
                    <p className={styles.mutedText} style={{ marginBottom: 12 }}>
                      Настройте получение уведомлений
                    </p>
                    <div style={{ display: 'grid', gap: 12 }}>
                      <label className={styles.checkboxLabel}>
                        <input type="checkbox" className={styles.checkboxInput} defaultChecked />
                        <span className={styles.value}>Email уведомления</span>
                      </label>
                      <label className={styles.checkboxLabel}>
                        <input type="checkbox" className={styles.checkboxInput} defaultChecked />
                        <span className={styles.value}>Уведомления о заказах</span>
                      </label>
                      <label className={styles.checkboxLabel}>
                        <input type="checkbox" className={styles.checkboxInput} defaultChecked />
                        <span className={styles.value}>Специальные предложения</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 'reviews' tab removed */}

            {/* Кнопка выхода */}
            <div className={styles.logoutWrap}>
              <button onClick={logout} className={styles.logoutBtn} style={{background: 'var(--color-dark)', color: 'var(--color-on-dark)'}}>Выйти</button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </PageContainer>
  );
}
