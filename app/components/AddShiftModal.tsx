"use client"
import React, { useState, useEffect } from 'react';
import styles from './AddShiftModal.module.scss';

interface User {
  id: string;
  username: string;
  avatar: string | null;
}

interface AddShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShiftAdded: () => void;
}

export default function AddShiftModal({ isOpen, onClose, onShiftAdded }: AddShiftModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      // Установить текущую дату по умолчанию
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
    }
  }, [isOpen]);

  async function fetchUsers() {
    try {
      setLoadingUsers(true);
      const token = localStorage.getItem('token');
      console.log('Fetching employees with token:', token ? 'exists' : 'missing');
      
      const response = await fetch('http://localhost:5001/api/schedule/employees', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Employees data:', data);
        const employeesList = data.employees || data;
        console.log('Setting users:', employeesList);
        setUsers(Array.isArray(employeesList) ? employeesList : []);
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        setError(`Ошибка загрузки сотрудников: ${errorData.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
      setError('Не удалось загрузить список сотрудников');
    } finally {
      setLoadingUsers(false);
    }
  }

  function calculateHours(start: string, end: string): number {
    if (!start || !end) return 0;
    
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    
    let hours = endHour - startHour;
    let minutes = endMin - startMin;
    
    if (minutes < 0) {
      hours -= 1;
      minutes += 60;
    }
    
    return hours + minutes / 60;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!selectedUserId || !date || !startTime || !endTime) {
      setError('Заполните все обязательные поля');
      return;
    }

    const hours = calculateHours(startTime, endTime);
    if (hours <= 0) {
      setError('Время окончания должно быть позже времени начала');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5001/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedUserId,
          shiftDate: date,
          startTime: startTime,
          endTime: endTime,
          hours,
          notes: notes || null,
        }),
      });

      if (response.ok) {
        onShiftAdded();
        handleClose();
      } else {
        const data = await response.json();
        setError(data.message || 'Ошибка при создании смены');
      }
    } catch (error) {
      console.error('Ошибка создания смены:', error);
      setError('Ошибка при создании смены');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setSelectedUserId(null);
    setDate('');
    setStartTime('');
    setEndTime('');
    setNotes('');
    setError('');
    onClose();
  }

  if (!isOpen) return null;

  const hours = calculateHours(startTime, endTime);

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Добавить смену</h2>
          <button className={styles.closeBtn} onClick={handleClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Сотрудник *</label>
            {loadingUsers ? (
              <div className={styles.loadingUsers}>Загрузка сотрудников...</div>
            ) : (
              <>
                <div className={styles.selectWrapper}>
                  <select
                    value={selectedUserId || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      console.log('Selected user ID:', value);
                      setSelectedUserId(value || null);
                    }}
                    required
                    disabled={users.length === 0}
                  >
                    <option value="">
                      {users.length === 0 ? 'Нет доступных сотрудников' : 'Выберите сотрудника'}
                    </option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedUserId && (
                  <div className={styles.selectedInfo}>
                    ✓ Выбран: {users.find(u => u.id === selectedUserId)?.username}
                  </div>
                )}
              </>
            )}
            {users.length === 0 && !loadingUsers && (
              <div className={styles.noUsers}>Сотрудники не найдены (worker, manager, creator)</div>
            )}
          </div>

          <div className={styles.field}>
            <label>Дата *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Начало *</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <label>Конец *</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          {startTime && endTime && hours > 0 && (
            <div className={styles.hoursInfo}>
              Продолжительность: {hours.toFixed(1)} ч
            </div>
          )}

          <div className={styles.field}>
            <label>Заметки</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Дополнительная информация..."
              rows={3}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={handleClose}
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Создание...' : 'Создать смену'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
