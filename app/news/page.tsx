"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import PageContainer from "../components/PageContainer";
import styles from "./News.module.scss";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4500";

interface Post {
  id: number;
  title: string;
  content: string;
  author?: string;
  created_at?: string;
  likes_count?: number;
  comments_count?: number;
  user_has_liked?: boolean;
  image?: string;
}


export default function NewsPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [likesLoading, setLikesLoading] = useState<Record<number, boolean>>({});
  const router = useRouter();
    // Removed local user state in favor of AuthContext's user

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('authToken') || localStorage.getItem('token')) : null;
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/api/news`, { headers });
      const data = await res.json().catch(() => null);
      const items = data?.news ?? data?.posts ?? data?.items ?? (Array.isArray(data) ? data : null);
      if (items && Array.isArray(items)) {
        setPosts(items);
      } else if (data?.success && !items && data?.data && Array.isArray(data.data)) {
        setPosts(data.data);
      } else {
        console.warn("Unexpected news response shape", data);
      }
    } catch (error) {
      console.error("Ошибка загрузки новостей:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      if (likesLoading[postId]) return;
      setLikesLoading(prev => ({ ...prev, [postId]: true }));
      const token = typeof window !== 'undefined' ? (localStorage.getItem('authToken') || localStorage.getItem('token')) : null;
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/news/${postId}/like`, { method: 'POST', headers });
      const data = await res.json().catch(() => null);
      if (data?.success) {
        const likes_count = data.likes_count ?? data.data?.likes_count;
        const user_has_liked = data.user_has_liked ?? data.data?.user_has_liked;
        setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, likes_count, user_has_liked } : p));
      } else {
        console.warn('Like failed:', data);
      }
    } catch (error) {
      console.error('Ошибка лайка:', error);
    } finally {
      setLikesLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleDelete = async (postId: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту новость?')) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/api/news/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      const data = await res.json();
      if (data?.success) {
        setPosts(prev => prev.filter(p => p.id !== postId));
      } else {
        alert(data?.error || 'Ошибка удаления');
      }
    } catch (error) {
      console.error('Ошибка удаления новости:', error);
      alert('Ошибка удаления новости');
    }
  };

  const openPostDetails = (post: Post) => {
    router.push(`/news/${post.id}`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <PageContainer>
        <div className={styles.wrap}>
          <div className={styles.inner}>
            <div style={{ textAlign: 'center' }}>
              <div style={{width:48,height:48,borderRadius:24,borderBottom:'4px solid var(--color-accent)', margin: '0 auto', animation: 'spin 1s linear infinite'}}></div>
              <p style={{color:'var(--color-muted)', marginTop:12}}>Загрузка новостей...</p>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className={styles.wrap}>
        <div className={styles.inner}>

          <div className={styles.hero}>
            <h1 className={styles.title}>Новости кофейни</h1>
            <p className={styles.subtitle}>Будьте в курсе последних событий, акций и новинок нашей кофейни</p>
            {user?.role === 'creator' && (
              <div style={{ marginTop: 12 }}>
                <a href="/admin/create-news" className={styles.btnPrimary} style={{ padding: '8px 12px', borderRadius: 10 }}>Добавить новость</a>
              </div>
            )}
          </div>

          <div className={styles.list}>
            {posts.map((post) => (
              <article key={post.id} className={styles.item}>
                {post.image && (
                  <div className={styles.itemImage}>
                    <img src={`${API_BASE}${post.image}`} alt={post.title} />
                  </div>
                )}
                
                <div className={styles.itemContent}>
                  <div className={styles.itemHeader}>
                    <div style={{ flex: 1 }}>
                      <h2 className={styles.itemTitle}>{post.title}</h2>
                      <div className={styles.meta}>
                        <span>Автор: {post.author ?? "Кофейня"}</span>
                        <span style={{marginLeft:12}}>{formatDate(post.created_at)}</span>
                      </div>
                    </div>
                    {user?.role === 'creator' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(post.id);
                        }}
                        className={styles.deleteBtn}
                        title="Удалить новость"
                      >
                        🗑️
                      </button>
                    )}
                  </div>

                  <p className={styles.content}>{post.content}</p>

                  <div className={styles.actions}>
                    <div className={styles.leftActions}>
                      <button onClick={() => handleLike(post.id)} className={`${styles.likeBtn} ${post.user_has_liked ? styles.liked : ''}`}>
                        <span>{post.user_has_liked ? '❤️' : '🤍'}</span>
                        <span>{post.likes_count ?? 0}</span>
                      </button>

                      <button onClick={() => openPostDetails(post)} className={styles.commentBtn}>
                        <span>💬</span>
                        <span>{post.comments_count ?? 0}</span>
                      </button>
                    </div>

                    <button onClick={() => openPostDetails(post)} className={styles.readMore}>Читать далее</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}