"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '../components/PageContainer';
import { useAuth } from '../contexts/AuthContext';
import AddShiftModal from '../components/AddShiftModal';
import styles from './Schedule.module.scss';

interface User {
  id: number;
  username: string;
  avatar: string | null;
}

interface Shift {
  id: number;
  user_id: number;
  shift_date: string;
  start_time: string;
  end_time: string;
  hours: number;
  notes: string | null;
  User?: User;
}

export default function SchedulePage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !user || user.role === 'guest') {
        router.push('/login');
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSchedule();
    }
  }, [currentWeekStart, isAuthenticated]);

  function getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  async function fetchSchedule() {
    try {
      setLoading(true);
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const startStr = currentWeekStart.toISOString().split('T')[0];
      const endStr = weekEnd.toISOString().split('T')[0];

      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5001/api/schedule?startDate=${startStr}&endDate=${endStr}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Преобразуем формат ответа для совместимости
        const shiftsData = data.shifts || data;
        const formattedShifts = shiftsData.map((shift: any) => ({
          ...shift,
          user_id: shift.user_id,
          User: {
            id: shift.user_id,
            username: shift.username,
            avatar: shift.avatar,
          }
        }));
        setShifts(formattedShifts);
      }
    } catch (error) {
      console.error('Ошибка загрузки графика:', error);
    } finally {
      setLoading(false);
    }
  }

  function navigateWeek(direction: number) {
    const newWeek = new Date(currentWeekStart);
    newWeek.setDate(newWeek.getDate() + direction * 7);
    setCurrentWeekStart(newWeek);
  }

  function goToCurrentWeek() {
    setCurrentWeekStart(getMonday(new Date()));
  }

  function formatDate(date: Date): string {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return `${days[date.getDay()]} ${date.getDate()}.${date.getMonth() + 1}`;
  }

  function formatWeekRange(): string {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    return `${currentWeekStart.getDate()}.${currentWeekStart.getMonth() + 1} - ${weekEnd.getDate()}.${weekEnd.getMonth() + 1}.${weekEnd.getFullYear()}`;
  }

  function getWeekDays(): Date[] {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  }

  function getShiftsForUserAndDay(userId: number, date: Date): Shift[] {
    const dateStr = date.toISOString().split('T')[0];
    return shifts.filter(
      shift => shift.user_id === userId && shift.shift_date === dateStr
    );
  }

  function getShiftsForDay(date: Date): Shift[] {
    const dateStr = date.toISOString().split('T')[0];
    return shifts.filter(shift => shift.shift_date === dateStr);
  }

  function getTotalHoursForUser(userId: number): number {
    return shifts
      .filter(shift => shift.user_id === userId)
      .reduce((sum, shift) => sum + shift.hours, 0);
  }

  function getUsersWithShifts(): User[] {
    const userMap = new Map<number, User>();
    shifts.forEach(shift => {
      if (shift.User && !userMap.has(shift.User.id)) {
        userMap.set(shift.User.id, shift.User);
      }
    });
    return Array.from(userMap.values());
  }

  if (authLoading) return <PageContainer><div className={styles.loading}>Загрузка...</div></PageContainer>;
  if (!isAuthenticated || !user || user.role === 'guest') return null;

  const weekDays = getWeekDays();
  const users = getUsersWithShifts();

  return (
    <PageContainer>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1>График работы</h1>
          {(user.role === 'creator' || user.role === 'manager') && (
            <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
              + Добавить смену
            </button>
          )}
        </div>

        <div className={styles.controls}>
          <div className={styles.weekNav}>
            <button className={styles.navBtn} onClick={() => navigateWeek(-1)}>←</button>
            <span className={styles.weekRange}>{formatWeekRange()}</span>
            <button className={styles.navBtn} onClick={() => navigateWeek(1)}>→</button>
          </div>
          <button className={styles.currentBtn} onClick={goToCurrentWeek}>
            Текущая неделя
          </button>
        </div>

        {loading ? (
          <div className={styles.loading}>Загрузка графика...</div>
        ) : isMobile ? (
          <div className={styles.cardsView}>
            {weekDays.map(day => {
              const dayShifts = getShiftsForDay(day);
              return (
                <div key={day.toISOString()} className={styles.dayCard}>
                  <div className={styles.dayCardHeader}>
                    <h3>{formatDate(day)}</h3>
                  </div>
                  {dayShifts.length === 0 ? (
                    <div className={styles.noShifts}>Нет смен</div>
                  ) : (
                    <div className={styles.shiftsList}>
                      {dayShifts.map(shift => (
                        <div key={shift.id} className={styles.shiftCard}>
                          <div className={styles.shiftCardEmployee}>
                            {shift.User?.avatar ? (
                              <img
                                src={`http://localhost:5001${shift.User.avatar}`}
                                alt={shift.User.username}
                                className={styles.shiftAvatar}
                              />
                            ) : (
                              <div className={styles.shiftAvatarPlaceholder}>
                                {shift.User?.username[0].toUpperCase()}
                              </div>
                            )}
                            <span>{shift.User?.username}</span>
                          </div>
                          <div>
                            <div className={styles.shiftCardTime}>
                              {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                            </div>
                            <div className={styles.shiftCardHours}>{shift.hours}ч</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.scheduleTable}>
              <thead>
                <tr>
                  <th className={styles.employeeCol}>Сотрудник</th>
                  {weekDays.map(day => (
                    <th key={day.toISOString()} className={styles.dayCol}>
                      {formatDate(day)}
                    </th>
                  ))}
                  <th className={styles.totalCol}>Итого</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '32px' }}>
                      Нет смен на этой неделе
                    </td>
                  </tr>
                ) : (
                  users.map(employee => (
                    <tr key={employee.id}>
                      <td className={styles.employeeCell}>
                        <div className={styles.employeeInfo}>
                          {employee.avatar ? (
                            <img
                              src={`http://localhost:5001${employee.avatar}`}
                              alt={employee.username}
                              className={styles.avatar}
                            />
                          ) : (
                            <div className={styles.avatarPlaceholder}>
                              {employee.username[0].toUpperCase()}
                            </div>
                          )}
                          <span className={styles.username}>{employee.username}</span>
                        </div>
                      </td>
                      {weekDays.map(day => {
                        const dayShifts = getShiftsForUserAndDay(employee.id, day);
                        return (
                          <td key={day.toISOString()} className={styles.dayCell}>
                            {dayShifts.map(shift => (
                              <div key={shift.id} className={styles.shiftBlock}>
                                <div className={styles.shiftTime}>
                                  {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                                </div>
                                <div className={styles.shiftHours}>{shift.hours} ч</div>
                              </div>
                            ))}
                          </td>
                        );
                      })}
                      <td className={styles.totalCell}>
                        {getTotalHoursForUser(employee.id)} ч
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <AddShiftModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onShiftAdded={fetchSchedule}
        />
      </div>
    </PageContainer>
  );
}
