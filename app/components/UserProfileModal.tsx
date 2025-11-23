"use client"
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import styles from "./UserProfileModal.module.scss";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';

interface UserProfileModalProps {
  userId: string;
  onClose: () => void;
}

interface UserProfile {
  id: string;
  username: string;
  role: string;
  avatar?: string;
  reputation: number;
  created_at: string;
}

export default function UserProfileModal({ userId, onClose }: UserProfileModalProps) {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteType, setVoteType] = useState<'up' | 'down' | null>(null);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    if (currentUser) {
      fetchVoteStatus();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/user/${userId}`);
      const data = await res.json();
      if (data.success && data.user) {
        setProfile(data.user);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVoteStatus = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_BASE}/api/user/${userId}/reputation-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setHasVoted(data.hasVoted);
        setVoteType(data.voteType);
      }
    } catch (error) {
      console.error('Error fetching vote status:', error);
    }
  };

  const handleVote = async (type: 'up' | 'down') => {
    if (!currentUser) {
      alert('Для голосования необходимо войти в систему');
      return;
    }

    if (currentUser.id === userId) {
      alert('Вы не можете голосовать за себя');
      return;
    }

    setVoting(true);
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/user/${userId}/reputation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ voteType: type })
      });

      const data = await res.json();
      if (data.success) {
        setProfile(prev => prev ? { ...prev, reputation: data.reputation } : null);
        setHasVoted(data.hasVoted);
        setVoteType(data.voteType);
      } else {
        alert(data.error || 'Ошибка голосования');
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert('Ошибка голосования');
    } finally {
      setVoting(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'worker': return 'Бариста';
      case 'manager': return 'Управляющий кофейни';
      case 'creator': return 'Создатель';
      case 'admin': return 'Админ';
      default: return 'Гость';
    }
  };

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (loading) {
    return (
      <div className={styles.backdrop} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.loading}>Загрузка...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.backdrop} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.error}>Пользователь не найден</div>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
        
        <div className={styles.content}>
          <div className={styles.avatarSection}>
            {profile.avatar ? (
              <img 
                src={`${API_BASE}${profile.avatar}`} 
                alt={profile.username}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {profile.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <h2 className={styles.username}>{profile.username}</h2>

          <div className={styles.badges}>
            <span className={styles.roleBadge}>
              {getRoleLabel(profile.role)}
            </span>
          </div>

          <div className={styles.reputationSection}>
            <div className={styles.reputationLabel}>Репутация</div>
            <div className={styles.reputationValue}>
              <span className={styles.coffeeIcon}>☕</span>
              <span className={styles.reputationNumber}>{profile.reputation}</span>
            </div>
          </div>

          {!isOwnProfile && currentUser && (
            <div className={styles.voteButtons}>
              <button 
                className={`${styles.voteBtn} ${styles.upvoteBtn} ${voteType === 'up' ? styles.active : ''}`}
                onClick={() => handleVote('up')}
                disabled={voting}
              >
                {voteType === 'up' ? '👍 Убрать' : '👍 Повысить'}
              </button>
              <button 
                className={`${styles.voteBtn} ${styles.downvoteBtn} ${voteType === 'down' ? styles.active : ''}`}
                onClick={() => handleVote('down')}
                disabled={voting}
              >
                {voteType === 'down' ? '👎 Убрать' : '👎 Понизить'}
              </button>
            </div>
          )}

          {isOwnProfile && (
            <div className={styles.ownProfileNote}>
              Это ваш профиль
            </div>
          )}

          <div className={styles.memberSince}>
            Участник с {new Date(profile.created_at).toLocaleDateString('ru-RU')}
          </div>
        </div>
      </div>
    </div>
  );
}
