"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PageContainer from "../../components/PageContainer";
import ReputationBadge from "../../components/ReputationBadge";
import UserProfileModal from "../../components/UserProfileModal";
import styles from "../NewsDetail.module.scss";

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
}

interface Comment {
  id: number;
  user_name: string;
  user_id?: number | string;
  content: string;
  created_at: string;
}

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [likeSending, setLikeSending] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!id) return;
    fetchData();
  }, [id]);

  async function fetchData() {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('authToken') || localStorage.getItem('token')) : null;
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const [postRes, commentsRes] = await Promise.all([
        fetch(`${API_BASE}/api/news/${id}`, { headers }),
        fetch(`${API_BASE}/api/news/${id}/comments`, { headers }),
      ]);

      const postData = await postRes.json().catch(() => null);
      const commentsData = await commentsRes.json().catch(() => null);

      const thePost = postData?.data ?? postData?.news ?? postData ?? null;
      setPost(thePost);

      const comm = commentsData?.comments ?? commentsData?.data ?? commentsData ?? [];
      setComments(Array.isArray(comm) ? comm : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleLike = async () => {
    if (!post) return;
    const postId = post.id;
    const currentlyLiked = !!post.user_has_liked;
    setPost({ ...post, user_has_liked: !currentlyLiked, likes_count: (post.likes_count ?? 0) + (currentlyLiked ? -1 : 1) });

    try {
      if (likeSending) return;
      setLikeSending(true);
      const token = typeof window !== 'undefined' ? (localStorage.getItem('authToken') || localStorage.getItem('token')) : null;
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/api/news/${postId}/like`, { method: 'POST', headers });
      const data = await res.json().catch(() => null);

      if (data?.success) {
        const likes_count = data.likes_count ?? data.data?.likes_count;
        const user_has_liked = data.user_has_liked ?? data.data?.user_has_liked ?? !currentlyLiked;
        setPost((prev) => prev ? { ...prev, likes_count, user_has_liked } : prev);
      } else {
        setPost((prev) => prev ? { ...prev, user_has_liked: currentlyLiked, likes_count: (prev!.likes_count ?? 0) + (currentlyLiked ? 1 : -1) } : prev);
        console.warn('Like failed', data);
      }
    } catch (err) {
      setPost((prev) => prev ? { ...prev, user_has_liked: currentlyLiked, likes_count: (prev!.likes_count ?? 0) + (currentlyLiked ? 1 : -1) } : prev);
      console.error(err);
    } finally {
      setLikeSending(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !post) return;
    setSending(true);
    try {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('authToken') || localStorage.getItem('token')) : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/api/news/${post.id}/comments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content: newComment }),
      });
      const data = await res.json().catch(() => null);
      if (data?.success) {
        setNewComment('');
        const commentsRes = await fetch(`${API_BASE}/api/news/${post.id}/comments`);
        const commentsData = await commentsRes.json().catch(() => null);
        const comm = commentsData?.comments ?? commentsData?.data ?? commentsData ?? [];
        setComments(Array.isArray(comm) ? comm : []);
        setPost((p) => p ? { ...p, comments_count: Array.isArray(comm) ? comm.length : (p.comments_count ?? 0) + 1 } : p);
      } else {
        console.warn('Add comment error', data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!post) return;
    try {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('authToken') || localStorage.getItem('token')) : null;
    const headers:any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/api/news/${post.id}/comments/${commentId}`, { method: 'DELETE', headers });
      const data = await res.json().catch(() => null);
      if (data?.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        setPost((p) => p ? { ...p, comments_count: Math.max((p.comments_count ?? 1) - 1, 0) } : p);
      } else {
        console.warn('Delete comment failed', data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <PageContainer>
      <div className={styles.wrap}>
        <div className={styles.inner}>
          <div style={{ textAlign: 'center' }}>
            <div style={{width:48,height:48,borderRadius:24,borderBottom:'4px solid var(--color-accent)', margin: '0 auto', animation: 'spin 1s linear infinite'}}></div>
            <p style={{color:'var(--color-muted)', marginTop:12}}>Загрузка новости...</p>
          </div>
        </div>
      </div>
    </PageContainer>
  );

  if (!post) return (
    <PageContainer>
      <div className={styles.wrap}>
        <div className={styles.inner} style={{textAlign:'center'}}>
          <p style={{color:'var(--color-text)'}}>Новость не найдена.</p>
          <Link href="/news" style={{marginTop:12,display:'inline-block',color:'var(--color-primary)'}}>Вернуться к новостям</Link>
        </div>
      </div>
    </PageContainer>
  );

  return (
    <PageContainer>
      <div className={styles.wrap}>
        <div className={styles.inner}>

          <article className={styles.article}>
            <header>
              <h1 className={styles.title}>{post.title}</h1>
              <div className={styles.meta}>
                <span>Автор: {post.author ?? 'Кофейня'}</span>
                <span style={{marginLeft:12}}>{formatDate(post.created_at)}</span>
              </div>
            </header>

            {(post as any).image && (
              <div className={styles.articleImage}>
                <img src={`${API_BASE}${(post as any).image}`} alt={post.title} />
              </div>
            )}

            <div className={styles.content}><p>{post.content}</p></div>

            <div className={styles.controls}>
              <div className={styles.leftControls}>
                <button onClick={handleLike} className={`${styles.likeBtn} ${post.user_has_liked ? styles.liked : ''}`}>
                  <span>{post.user_has_liked ? '❤️' : '🤍'}</span>
                  <span>{post.likes_count ?? 0}</span>
                </button>

                <div style={{display:'flex', alignItems:'center', gap:8, color:'var(--color-muted)'}}>
                  <span>💬</span>
                  <span>{post.comments_count ?? comments.length}</span>
                </div>
              </div>
            </div>

            <section style={{marginTop:18}}>
              <h3 style={{fontSize:18, fontWeight:700, color:'var(--color-dark)', marginBottom:10}}>Оставить комментарий</h3>
              <div className={styles.commentForm}>
                <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Напишите ваш комментарий..." className={styles.commentInput} />
                <button onClick={handleAddComment} disabled={sending || !newComment.trim()} className={styles.submitBtn}>{sending ? 'Отправка...' : 'Отправить'}</button>
              </div>
            </section>

            <section>
              <h3 style={{fontSize:18, fontWeight:700, color:'var(--color-dark)', marginBottom:10}}>Комментарии ({comments.length})</h3>
              {comments.length === 0 ? (
                <p style={{color:'var(--color-muted)', textAlign:'center', padding:'24px 0'}}>Пока нет комментариев. Будьте первым!</p>
              ) : (
                <div className={styles.comments}>
                  {comments.map((c) => (
                    <div key={c.id} className={styles.comment}>
                      <div style={{display:'flex', alignItems:'start', gap:12}}>
                        <div 
                          className={styles.avatarWrapper}
                          onClick={() => (c as any).user_id && setSelectedUserId((c as any).user_id)}
                          style={{ cursor: (c as any).user_id ? 'pointer' : 'default' }}
                        >
                          {(c as any).avatar ? (
                            <img 
                              src={`${API_BASE}${(c as any).avatar}`} 
                              alt={c.user_name}
                              className={styles.commentAvatar}
                            />
                          ) : (
                            <div className={styles.commentAvatarPlaceholder}>
                              {c.user_name?.charAt(0).toUpperCase() || '?'}
                            </div>
                          )}
                        </div>
                        <div style={{flex:1, minWidth:0}}>
                          <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:4}}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span 
                                className={styles.commentAuthor}
                                onClick={() => (c as any).user_id && setSelectedUserId((c as any).user_id)}
                                style={{ cursor: (c as any).user_id ? 'pointer' : 'default' }}
                              >{c.user_name}</span>
                              {(c as any).reputation !== undefined && (
                                <ReputationBadge reputation={(c as any).reputation} size="small" />
                              )}
                              {(c as any).role && (
                                <span style={{ 
                                  fontSize: '0.7rem', 
                                  color: 'var(--color-muted)',
                                  background: 'rgba(0,0,0,0.04)',
                                  padding: '2px 6px',
                                  borderRadius: '999px',
                                  marginLeft: 2
                                }}>
                                  {(() => {
                                    const r = (c as any).role;
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
                            <span style={{color:'var(--color-muted)', fontSize:12}}>{formatDate(c.created_at)}</span>
                          </div>
                          <p style={{color:'var(--color-text)', fontWeight:500}}>{c.content}</p>
                          {user && (String(user.id) === String(c.user_id) || user.username === c.user_name || ['worker','manager','creator','admin'].includes(user.role)) && (
                            <div style={{marginTop:8}}>
                              <button onClick={() => handleDeleteComment(c.id)} className={styles.deleteBtn}>Удалить</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </article>
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
