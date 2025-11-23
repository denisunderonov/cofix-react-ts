"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '../../components/PageContainer';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../AdminForm.module.scss';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';

export default function CreateDrinkPage() {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
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
      formData.append('name', name);
      if (description) formData.append('description', description);
      if (price) formData.append('price', price);
      if (category) formData.append('category', category);
      if (image) formData.append('image', image);

      const res = await fetch(`${API_BASE}/api/drinks/upload`, {
        method: 'POST',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
        body: formData
      });
      const js = await res.json();
      if (js.success) {
        setMessage('✅ Напиток создан!');
        setName('');
        setDescription('');
        setPrice('');
        setCategory('');
        setImage(null);
        setImagePreview('');
        setTimeout(() => router.push('/menu'), 1500);
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
          <h1 className={styles.formTitle}>Добавить напиток</h1>
          <p className={styles.formSubtitle}>Создайте новый напиток в меню кофейни</p>
        </div>

        <form onSubmit={submit} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>Название *</label>
              <input
                id="name"
                type="text"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например, Капучино"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="category" className={styles.label}>Категория</label>
              <select
                id="category"
                className={styles.input}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Выберите категорию</option>
                <option value="coffee">Кофе</option>
                <option value="tea">Чай</option>
                <option value="latte">Латте</option>
                <option value="cappuccino">Капучино</option>
                <option value="cold">Холодные напитки</option>
                <option value="dessert">Десертные напитки</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>Описание</label>
            <textarea
              id="description"
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите напиток, его вкус и особенности"
              rows={4}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="price" className={styles.label}>Цена (₽)</label>
            <input
              id="price"
              type="number"
              step="0.01"
              className={styles.input}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="250.00"
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
              Создать напиток
            </button>
          </div>

          {message && <div className={styles.message}>{message}</div>}
        </form>
      </div>
    </PageContainer>
  );
}
