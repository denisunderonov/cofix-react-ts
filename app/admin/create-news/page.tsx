"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '../../components/PageContainer';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../AdminForm.module.scss';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';

export default function CreateNewsPage() {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'creator')) {
      router.push('/');
    }
  }, [loading, isAuthenticated, user, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Сохраняю...');
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (image) formData.append('image', image);

      const res = await fetch(`${API_BASE}/api/news/upload`, {
        method: 'POST',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
        body: formData
      });
      const js = await res.json();
      if (js.success) {
        setMessage('✅ Новость создана!');
        setTitle('');
        setContent('');
        setImage(null);
        setImagePreview('');
        setTimeout(() => router.push('/news'), 1500);
      } else {
        setMessage(js.error || 'Ошибка');
      }
    } catch (e) {
      console.error(e);
      setMessage('Ошибка запроса');
    }
  }

  if (loading) return <PageContainer><div className={styles.loading}>Загрузка...</div></PageContainer>;
  if (!isAuthenticated || user?.role !== 'creator') return null;

  return (
    <PageContainer>
      <div className={styles.formContainer}>
        <div className={styles.formHeader}>
          <h1 className={styles.formTitle}>Создать новость</h1>
          <p className={styles.formSubtitle}>Добавьте новость для публикации на сайте</p>
        </div>

        <form onSubmit={submit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>Заголовок *</label>
            <input
              id="title"
              type="text"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите заголовок новости"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="content" className={styles.label}>Содержание *</label>
            <textarea
              id="content"
              className={styles.textarea}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Введите текст новости"
              rows={8}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="image" className={styles.label}>Изображение</label>
            <div className={styles.fileInputWrapper}>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={styles.fileInput}
              />
              <label htmlFor="image" className={styles.fileInputLabel}>
                <span className={styles.fileInputIcon}>📎</span>
                <span>{image ? image.name : 'Выберите изображение'}</span>
              </label>
            </div>
            {imagePreview && (
              <div className={styles.imagePreview}>
                <img src={imagePreview} alt="Preview" className={styles.previewImage} />
                <button
                  type="button"
                  onClick={() => { setImage(null); setImagePreview(''); }}
                  className={styles.removeImageBtn}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={() => router.back()} className={styles.btnSecondary}>
              Отмена
            </button>
            <button type="submit" className={styles.btnPrimary}>
              Создать новость
            </button>
          </div>

          {message && <div className={styles.message}>{message}</div>}
        </form>
      </div>
    </PageContainer>
  );
}
