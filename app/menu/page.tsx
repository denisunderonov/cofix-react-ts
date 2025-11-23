"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Link from "next/link";
import PageContainer from "../components/PageContainer";
import DrinkCard from "./DrinkCard";
import ReputationBadge from "../components/ReputationBadge";
import UserProfileModal from "../components/UserProfileModal";
import styles from "./Menu.module.scss";
import Toast from "../components/Toast";

interface Drink {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  ingredients: string[];
  rating: number;
  reviews_count: number;
}

interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  content?: string;
  created_at: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4500";

// No local fallback: rely on backend API responses

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [drinkReviews, setDrinkReviews] = useState<Review[]>([]);
  const { user } = useAuth();
  const [showReviews, setShowReviews] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Загрузка напитков из БД
  useEffect(() => {
    fetchDrinks();
  }, []);

  const fetchDrinks = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/drinks`);
      const data = await response.json();
      if (data.success && Array.isArray(data.drinks)) {
        setDrinks(data.drinks);
        return;
      }
      // If backend didn't return success but returned array-like payload
      if (Array.isArray(data) && data.length) {
        setDrinks(data);
        return;
      }
    } catch (error) {
      console.error("Ошибка загрузки напитков:", error);
      setDrinks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrinkReviews = async (drinkId: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/drinks/${drinkId}/reviews`);
      const data = await response.json();
      if (data.success) {
        setDrinkReviews(data.reviews);
      }
    } catch (error) {
      console.error("Ошибка загрузки отзывов:", error);
    }
  };

  const categories = [
    { id: "all", name: "Все напитки" },
    { id: "coffee", name: "Кофе" },
    { id: "tea", name: "Чай" },
    { id: "cold", name: "Холодные напитки" },
    { id: "other", name: "Другие" },
  ];

  const filteredDrinks =
    selectedCategory === "all"
      ? drinks
      : drinks.filter((drink) => drink.category === selectedCategory);

  // Edit modal state (controlled form)
  const [editDrink, setEditDrink] = useState<any>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPrice, setEditPrice] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  const handleAddReview = async (drinkId: number) => {
    try {
      // Attach token if present (same logic as in drink detail page)
      const token = typeof window !== 'undefined' ? (localStorage.getItem('authToken') || localStorage.getItem('token')) : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Backend expects { rating, content }
      const payload = { rating: newReview.rating, content: newReview.comment };

      const response = await fetch(`${API_BASE}/api/drinks/${drinkId}/reviews`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (data && data.success) {
        setNewReview({ rating: 5, comment: "" });
        setShowReviews(false);
        setSelectedDrink(null);
        // Обновляем отзывы для этого напитка
        fetchDrinkReviews(drinkId);
      } else {
        console.warn('Failed to add review', data);
      }
    } catch (error) {
      console.error("Ошибка добавления отзыва:", error);
    }
  };

  const openDrinkDetails = async (drink: Drink) => {
    setSelectedDrink(drink);
    setShowReviews(false);
    await fetchDrinkReviews(drink.id);
  };

  const openReviews = async (drink: Drink) => {
    setSelectedDrink(drink);
    setShowReviews(true);
    await fetchDrinkReviews(drink.id);
  };

  const handleDeleteDrink = async (drinkId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот напиток?')) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/api/drinks/${drinkId}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      const data = await res.json();
      if (data?.success) {
        setDrinks(prev => prev.filter(d => d.id !== drinkId));
        setToast({ message: 'Напиток удалён', type: 'success' });
      } else {
        setToast({ message: data?.error || 'Ошибка удаления', type: 'error' });
      }
    } catch (error) {
      console.error('Ошибка удаления напитка:', error);
      setToast({ message: 'Ошибка удаления напитка', type: 'error' });
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className={styles.page}>
          <div className={styles.container}>
            <div style={{ textAlign: "center" }}>
              <div className={styles.spinner}></div>
              <p className={styles.loadingText}>Загрузка меню...</p>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className={styles.page}>
        <div className={styles.container}>
          {/* Заголовок */}
          <div className={styles.header}>
            <h1 className={styles.h1}>Меню</h1>
            <p className={styles.hIntro}>
              Тут вы можете посмотреть все доступные напитки, их состав и отзывы
              гостей
            </p>
            {/* Creator-only quick actions (visible on menu page) */}
            {user?.role === 'creator' && (
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
                <a href="/admin/create-drink" className={styles.btnOutline} style={{ padding: '8px 12px', borderRadius: 10 }}>Добавить напиток</a>
              </div>
            )}
          </div>

          {/* Фильтры по категориям */}
          <div className={styles.categories}>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`${styles.categoryBtn} ${
                  selectedCategory === category.id
                    ? styles.categoryActive
                    : styles.categoryOutline
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Сетка напитков */}
          <div className={styles.grid}>
            {filteredDrinks.map((drink) => (
              <div key={drink.id} style={{ position: 'relative' }}>
                <DrinkCard drink={drink} onEdit={(d) => {
                  setEditDrink(d);
                  setEditName(d.name || '');
                  setEditDesc(d.description || '');
                  setEditPrice(d.price ? String(d.price) : '');
                }} />
                {user?.role === 'creator' && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteDrink(drink.id);
                    }}
                    className={styles.deleteDrinkBtn}
                    title="Удалить напиток"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Inline edit modal for creators */}
          {editDrink && (
            <div className={styles.modalBackdrop}>
              <div className={styles.modal}>
                <div className={styles.modalContent}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className={styles.modalTitle}>Редактирование: {editDrink.name}</h2>
                    <button className={styles.closeBtn} onClick={() => setEditDrink(null)}>×</button>
                  </div>

                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    // client-side validation
                    if (!editName.trim()) { setToast({ message: 'Название обязательно', type: 'error' }); return; }
                    if (editPrice && isNaN(Number(editPrice))) { setToast({ message: 'Цена должна быть числом', type: 'error' }); return; }

                    setEditSaving(true);
                    try {
                      const token = typeof window !== 'undefined' ? (localStorage.getItem('authToken') || localStorage.getItem('token')) : null;
                      const headers:any = { 'Content-Type': 'application/json' };
                      if (token) headers['Authorization'] = `Bearer ${token}`;

                      const body = {
                        name: editName.trim(),
                        description: editDesc.trim() || null,
                        price: editPrice ? Number(editPrice) : null,
                      };

                      const res = await fetch(`${API_BASE}/api/drinks/${editDrink.id}`, { method: 'PATCH', headers, body: JSON.stringify(body) });
                      const js = await res.json().catch(() => null);
                      if (js?.success) {
                        // update local drinks list
                        setDrinks((prev) => prev.map(x => String(x.id) === String(js.drink.id) ? js.drink : x));
                        setToast({ message: 'Напиток сохранён', type: 'success' });
                        setEditDrink(null);
                      } else {
                        setToast({ message: js?.error || 'Ошибка при сохранении', type: 'error' });
                      }
                    } catch (err) {
                      console.error(err);
                      setToast({ message: 'Ошибка запроса', type: 'error' });
                    } finally {
                      setEditSaving(false);
                    }
                  }}>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: 'block', fontWeight: 700 }}>Название</label>
                      <input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8 }} />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: 'block', fontWeight: 700 }}>Описание</label>
                      <textarea id="edit-desc" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8 }} rows={4} />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: 'block', fontWeight: 700 }}>Цена</label>
                      <input id="edit-price" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} style={{ width: '120px', padding: 8, borderRadius: 8 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button type="button" className={styles.btnOutline} onClick={() => setEditDrink(null)}>Отмена</button>
                      <button type="submit" className={styles.btnPrimary} disabled={editSaving}>{editSaving ? 'Сохраняю...' : 'Сохранить'}</button>
                    </div>
                  </form>

                  {toast && (
                    <div style={{ marginTop: 12 }}>
                      <Toast message={toast.message} type={toast.type === 'error' ? 'error' : 'success'} onClose={() => setToast(null)} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Модальное окно с деталями напитка */}
          {selectedDrink && !showReviews && (
            <div className={styles.modalBackdrop}>
              <div className={styles.modal}>
                <div className={styles.modalContent}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 16,
                    }}
                  >
                    <h2 className={styles.modalTitle}>{selectedDrink.name}</h2>
                    <button
                      onClick={() => setSelectedDrink(null)}
                      className={styles.closeBtn}
                    >
                      ×
                    </button>
                  </div>

                  <div className={styles.modalImage}>
                    <span className={styles.emoji}>☕</span>
                  </div>

                  <p className={styles.modalDesc}>
                    {selectedDrink.description}
                  </p>

                  <div style={{ marginBottom: 16 }}>
                    <h3
                      style={{
                        fontWeight: 700,
                        color: "var(--color-dark)",
                        marginBottom: 8,
                      }}
                    >
                      Состав:
                    </h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {selectedDrink.ingredients.map((ingredient, index) => (
                        <span key={index} className={styles.ingredientTag}>
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={styles.modalFooter}>
                    <span
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: "var(--color-primary)",
                      }}
                    >
                      {selectedDrink.price}₽
                    </span>
                    <button
                      onClick={() => setShowReviews(true)}
                      className={styles.btnPrimary}
                    >
                      Оставить отзыв
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Модальное окно с отзывами */}
          {selectedDrink && showReviews && (
            <div className={styles.modalBackdrop}>
              <div className={styles.modal}>
                <div className={styles.modalContent}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 16,
                    }}
                  >
                    <h2 className={styles.modalTitle}>
                      Отзывы: {selectedDrink.name}
                    </h2>
                    <button
                      onClick={() => setShowReviews(false)}
                      className={styles.closeBtn}
                    >
                      ×
                    </button>
                  </div>

                  {/* Форма добавления отзыва */}
                  <div
                    style={{
                      marginBottom: 16,
                      padding: 12,
                      background: "rgba(var(--color-primary-rgb),0.04)",
                      borderRadius: 12,
                      border: "1px solid rgba(var(--color-primary-rgb),0.12)",
                    }}
                  >
                    <h3
                      style={{
                        fontWeight: 700,
                        color: "var(--color-dark)",
                        marginBottom: 8,
                      }}
                    >
                      Оставить отзыв
                    </h3>

                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--color-dark)', marginBottom: 8 }}>Оценка:</label>
                      <div className={styles.ratingRow} role="radiogroup" aria-label="Оценка">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            className={`${styles.ratingBtn} ${n === newReview.rating ? styles.ratingBtnActive : ''}`}
                            aria-pressed={n === newReview.rating}
                            onClick={() => setNewReview({ ...newReview, rating: n })}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--color-dark)', marginBottom: 8 }}>Комментарий:</label>
                      <textarea
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid rgba(var(--color-primary-rgb),0.12)', borderRadius: 10 }}
                        rows={3}
                        placeholder="Поделитесь вашим мнением..."
                      />
                    </div>

                    <button onClick={() => handleAddReview(selectedDrink.id)} disabled={!newReview.comment.trim()} className={styles.btnPrimary}>
                      Отправить отзыв
                    </button>
                  </div>

                  {/* Список отзывов */}
                  <div>
                    <h3
                      style={{
                        fontWeight: 700,
                        color: "var(--color-dark)",
                        marginBottom: 12,
                      }}
                    >
                      Все отзывы ({drinkReviews.length})
                    </h3>

                    {drinkReviews.length === 0 ? (
                      <p
                        style={{
                          color: "var(--color-muted)",
                          textAlign: "center",
                          padding: "12px 0",
                        }}
                      >
                        Пока нет отзывов. Будьте первым!
                      </p>
                    ) : (
                      <div className={styles.reviewsList}>
                        {drinkReviews.map((review) => (
                          <div key={review.id} className={styles.reviewItem}>
                            <div className={styles.reviewHeader}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div 
                                  className={styles.avatarWrapper}
                                  onClick={() => (review as any).user_id && setSelectedUserId((review as any).user_id)}
                                  style={{ cursor: (review as any).user_id ? 'pointer' : 'default' }}
                                >
                                  {(review as any).avatar ? (
                                    <img 
                                      src={`${API_BASE}${(review as any).avatar}`} 
                                      alt={review.user_name}
                                      className={styles.reviewAvatar}
                                    />
                                  ) : (
                                    <div className={styles.reviewAvatarPlaceholder}>
                                      {review.user_name?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                  )}
                                </div>
                                <div style={{minWidth:0, flex:1}}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span
                                      style={{
                                        fontWeight: 600,
                                        color: "var(--color-dark)",
                                        cursor: (review as any).user_id ? 'pointer' : 'default'
                                      }}
                                      onClick={() => (review as any).user_id && setSelectedUserId((review as any).user_id)}
                                    >
                                      {review.user_name}
                                    </span>
                                    {(review as any).reputation !== undefined && (
                                      <ReputationBadge reputation={(review as any).reputation} size="small" />
                                    )}
                                    {(review as any).role && (
                                      <span style={{ 
                                        fontSize: '0.75rem', 
                                        color: 'var(--color-muted)',
                                        background: 'rgba(0,0,0,0.04)',
                                        padding: '2px 8px',
                                        borderRadius: '999px'
                                      }}>
                                        {(() => {
                                          const r = (review as any).role;
                                          switch (r) {
                                            case 'worker': return 'Бариста';
                                            case 'manager': return 'Управляющий кофейни';
                                            case 'creator': return 'Создатель';
                                            case 'admin': return 'Админ';
                                            default: return 'Гость';
                                          }
                                        })()}
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <span
                                        key={star}
                                        style={{
                                          fontSize: 14,
                                          color:
                                            star <= review.rating
                                              ? "var(--color-accent)"
                                              : "rgba(0,0,0,0.08)",
                                        }}
                                      >
                                        ★
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <p>{review.content ?? review.comment}</p>
                            <span
                              style={{
                                color: "var(--color-muted)",
                                fontSize: 12,
                              }}
                            >
                              {new Date(review.created_at).toLocaleDateString(
                                "ru-RU"
                              )}
                            </span>
                            {(user && (String(user.id) === String((review as any).user_id) || user.username === review.user_name || ['worker','manager','creator','admin'].includes(user.role))) && (
                              <div style={{ marginTop: 8 }}>
                                <button className={styles.deleteBtn} onClick={async () => {
                                  try {
                                    const token = typeof window !== 'undefined' ? (localStorage.getItem('authToken') || localStorage.getItem('token')) : null;
                                    const headers:any = {};
                                    if (token) headers['Authorization'] = `Bearer ${token}`;
                                    const res = await fetch(`${API_BASE}/api/drinks/${selectedDrink.id}/reviews/${review.id}`, { method: 'DELETE', headers });
                                    const js = await res.json().catch(() => null);
                                    if (js?.success) setDrinkReviews((prev) => prev.filter(r => r.id !== review.id));
                                  } catch(e) { console.error(e) }
                                }}>Удалить</button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedUserId && (
        <UserProfileModal 
          userId={selectedUserId} 
          onClose={() => setSelectedUserId(null)} 
        />
      )}
    </PageContainer>
  );
}
