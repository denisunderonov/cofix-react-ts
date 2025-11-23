"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import PageContainer from "../../components/PageContainer";
import ReputationBadge from "../../components/ReputationBadge";
import UserProfileModal from "../../components/UserProfileModal";
import styles from "../DrinkDetail.module.scss";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4500";

// Rely on backend. No local fallback data here.

export default function DrinkDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [drink, setDrink] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchData();
  }, [id]);

  async function fetchData() {
    setLoading(true);
    try {
      const [dRes, rRes] = await Promise.all([
        fetch(`${API_BASE}/api/drinks/${id}`),
        fetch(`${API_BASE}/api/drinks/${id}/reviews`),
      ]);
      const d = await dRes.json().catch(() => null);
      const r = await rRes.json().catch(() => null);
      const found = d?.drink ?? d?.data ?? d ?? null;
      // if backend returned nothing for this id, set null so UI shows "not found"
      if (!found) {
        setDrink(null);
      } else {
        setDrink(found);
      }

      setReviews(r?.reviews ?? r?.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmitReview = async () => {
    if (!id || !newReview.comment.trim()) return;
    setSending(true);
    try {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('authToken') || localStorage.getItem('token')) : null;
      const headers:any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      // Send { rating, content } to match backend expectations
      const res = await fetch(`${API_BASE}/api/drinks/${id}/reviews`, {
        method: 'POST', headers, body: JSON.stringify({ rating: newReview.rating, content: newReview.comment })
      });
      const data = await res.json().catch(() => null);
      if (data?.success) {
        setNewReview({ rating: 5, comment: '' });
        // refresh reviews
        const rr = await fetch(`${API_BASE}/api/drinks/${id}/reviews`);
        const rdata = await rr.json().catch(() => null);
        setReviews(rdata?.reviews ?? rdata?.data ?? []);
      } else {
        console.warn('Failed to submit review', data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('authToken') || localStorage.getItem('token')) : null;
      const headers:any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/drinks/${id}/reviews/${reviewId}`, { method: 'DELETE', headers });
      const data = await res.json().catch(() => null);
      if (data?.success) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      } else {
        console.warn('Delete review failed', data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <PageContainer>
      <div className={styles.wrap}><p>Загрузка...</p></div>
    </PageContainer>
  );

  if (!drink) return (
    <PageContainer>
      <div className={styles.wrap}><p>Напиток не найден.</p></div>
    </PageContainer>
  );

  const avgRating = reviews.length ? Math.round((reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length) * 10) / 10 : 0;

  return (
    <PageContainer>
      <div className={styles.wrap}>
        <div className={styles.header}>
          <img 
            src={drink.image ? `${API_BASE}${drink.image}` : `https://source.unsplash.com/1200x800?coffee&sig=${drink.id}`} 
            alt={drink.name} 
            className={styles.hero} 
          />
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{drink.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className={styles.price}>{drink.price ? `${drink.price}₽` : '—'}</div>
              {/* Creator-only quick actions on drink page */}
              {user?.role === 'creator' && (
                <div className={styles.adminActions}>
                  <a href="/admin/create-drink" className={styles.btnOutline} style={{ padding: '6px 10px', borderRadius: 8 }}>Добавить напиток</a>
                </div>
              )}
            </div>
          </div>
          <div className={styles.meta}>Средний рейтинг: <strong>{avgRating}</strong> — {reviews.length} отзывов</div>
        </div>

        <div className={styles.content}>
          <section className={styles.description}>
            <h2>Описание</h2>
            <p>{drink.description}</p>
          </section>

          <section className={styles.reviewsSection}>
            <h3>Отзывы гостей</h3>
            <div className={styles.addReview}>
              <label style={{ fontWeight: 600 }}>Оценка</label>
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
              <textarea value={newReview.comment} onChange={(e) => setNewReview({...newReview, comment: e.target.value})} placeholder="Ваш отзыв..." />
              <button onClick={handleSubmitReview} disabled={sending || !newReview.comment.trim()} className={styles.submitBtn}>{sending ? 'Отправка...' : 'Отправить'}</button>
            </div>

            <div className={styles.reviewsList}>
                {reviews.length === 0 ? (
                <p className={styles.empty}>Пока нет отзывов. Будьте первым!</p>
              ) : (
                reviews.map((r:any) => (
                  <div key={r.id} className={styles.reviewItem}>
                    <div style={{display:'flex', alignItems:'start', gap:12}}>
                      <div 
                        className={styles.avatarWrapper}
                        onClick={() => r.user_id && setSelectedUserId(r.user_id)}
                        style={{ cursor: r.user_id ? 'pointer' : 'default' }}
                      >
                        {r.avatar ? (
                          <img 
                            src={`${API_BASE}${r.avatar}`} 
                            alt={r.user_name}
                            className={styles.reviewAvatar}
                          />
                        ) : (
                          <div className={styles.reviewAvatarPlaceholder}>
                            {r.user_name?.charAt(0).toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                      <div style={{flex:1, minWidth:0}}>
                        <div className={styles.reviewHeader}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <strong 
                              onClick={() => r.user_id && setSelectedUserId(r.user_id)}
                              style={{ cursor: r.user_id ? 'pointer' : 'default' }}
                            >{r.user_name}</strong>
                            {r.reputation !== undefined && (
                              <ReputationBadge reputation={r.reputation} size="small" />
                            )}
                            {r.role && (
                              <span style={{ 
                                fontSize: '0.7rem', 
                                color: 'var(--color-muted)',
                                background: 'rgba(0,0,0,0.04)',
                                padding: '2px 6px',
                                borderRadius: '999px',
                                marginLeft: 2
                              }}>
                                {(() => {
                                  switch (r.role) {
                                    case 'worker': return 'Бариста';
                                    case 'manager': return 'Управляющий кофейни';
                                    case 'creator': return 'Создатель';
                                    case 'guest':
                                    default: return 'Гость';
                                  }
                                })()}
                              </span>
                            )}
                          </div>
                          <span className={styles.revMeta}>{r.rating} ★ — {new Date(r.created_at).toLocaleDateString('ru-RU')}</span>
                        </div>
                        <p style={{marginTop:6}}>{r.content ?? r.comment}</p>
                        {(user && (String(user.id) === String(r.user_id) || user.username === r.user_name || ['worker','manager','creator','admin'].includes(user.role))) && (
                          <div style={{ marginTop: 8 }}>
                            <button className={styles.deleteBtn} onClick={() => handleDeleteReview(r.id)}>Удалить</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
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
