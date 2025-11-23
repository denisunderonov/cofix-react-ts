"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '../../components/PageContainer';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Users.module.scss';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';

export default function UsersAdminPage() {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      // Redirect if not creator
      if (!isAuthenticated || !user || user.role !== 'creator') {
        router.push('/');
      } else {
        fetchUsers();
      }
    }
  }, [loading, isAuthenticated, user, router]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
  const q = search ? `?search=${encodeURIComponent(search)}` : '';
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const headers: any = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/api/admin/users${q}`, { headers });
  const js = await res.json().catch(() => null);
      if (js && js.success) {
        setUsers(js.users || []);
        setErrorMsg(null);
      } else {
        setUsers([]);
        setErrorMsg(js?.error || js?.message || 'Ошибка при получении пользователей');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Ошибка сети при получении пользователей');
    } finally {
      setLoadingUsers(false);
    }
  }

  const updateRole = async (id: string, role: string) => {
    try {
      const token = localStorage.getItem('authToken');
      // optimistic update with undo
      const prev = users.find(u => u.id === id);
      const prevRole = prev?.role;

      // send request
  const res = await fetch(`${API_BASE}/api/admin/users/${id}/role`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' }, body: JSON.stringify({ role }) });
      const js = await res.json();
      if (js.success) {
        // apply server result
        setUsers((s) => s.map(u => u.id === id ? js.user : u));
        // show undo toast
        setUndo({ id, prevRole, timer: window.setTimeout(() => setUndo(null), 8000) });
      } else {
        alert(js.error || 'Ошибка');
      }
    } catch (e) {
      console.error(e);
      alert('Ошибка запроса');
    }
  }

  const updateReputation = async (id: string, newReputation: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/api/admin/users/${id}/reputation`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ reputation: newReputation })
      });
      const js = await res.json();
      
      if (js.success) {
        setUsers((s) => s.map(u => u.id === id ? { ...u, reputation: js.user.reputation } : u));
      } else {
        alert(js.error || 'Ошибка обновления репутации');
      }
    } catch (e) {
      console.error(e);
      alert('Ошибка запроса');
    }
  }

  const deleteUser = async (id: string, username: string) => {
    if (!confirm(`Вы уверены, что хотите удалить пользователя "${username}"? Это действие нельзя отменить.`)) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      const js = await res.json();
      
      if (js.success) {
        setUsers((s) => s.filter(u => u.id !== id));
        alert('Пользователь успешно удалён');
      } else {
        alert(js.error || 'Ошибка удаления');
      }
    } catch (e) {
      console.error(e);
      alert('Ошибка запроса');
    }
  }

  const [undo, setUndo] = React.useState<{ id: string, prevRole?: string | null, timer?: number } | null>(null);

  const handleUndo = async () => {
    if (!undo) return;
    try {
      const token = localStorage.getItem('authToken');
      // cancel timeout
      if (undo.timer) window.clearTimeout(undo.timer);
  const res = await fetch(`${API_BASE}/api/admin/users/${undo.id}/role`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' }, body: JSON.stringify({ role: undo.prevRole }) });
      const js = await res.json().catch(() => null);
      if (js?.success) {
        setUsers((s) => s.map(u => u.id === undo.id ? js.user : u));
      } else {
        // fallback: set locally
        setUsers((s) => s.map(u => u.id === undo.id ? { ...u, role: undo.prevRole } : u));
      }
    } catch (e) {
      console.error('Undo failed', e);
    } finally {
      setUndo(null);
    }
  }

  if (loading) return <PageContainer><div>Загрузка...</div></PageContainer>;

  if (!isAuthenticated || user?.role !== 'creator') {
    return <PageContainer><h1>Пользователи</h1><p>Доступ запрещён.</p></PageContainer>;
  }

  return (
    <PageContainer>
      <h1>Пользователи</h1>
      {undo && (
        <div className={styles.undoToast} role="status" aria-live="polite">
          <div className={styles.undoMsg}>Роль изменена</div>
          <button className={styles.undoBtn} onClick={handleUndo}>Отменить</button>
        </div>
      )}
      <div style={{ marginBottom: 12 }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по username" />
        <button onClick={fetchUsers} style={{ marginLeft: 8 }}>Поиск</button>
      </div>

      {loadingUsers ? <div>Загрузка...</div> : (
        <div className={styles.usersWrap}>
          {errorMsg && <div style={{ color: 'var(--color-danger, #b00020)', marginBottom: 12 }}>{errorMsg}</div>}
          {!errorMsg && users.length === 0 && <div style={{ color: 'var(--color-muted)', marginBottom: 12 }}>Пользователи не найдены.</div>}
          <table className={styles.usersTable}>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Репутация</th>
                <th>Изменить роль</th>
                <th>Удалить</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td><span className={styles.roleBadge}>{u.role}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button 
                        className={styles.reputationBtn}
                        onClick={() => updateReputation(u.id, (u.reputation || 0) - 1)}
                        title="Уменьшить репутацию"
                      >
                        −
                      </button>
                      <span style={{ minWidth: 40, textAlign: 'center', fontWeight: 600 }}>
                        {u.reputation || 0}
                      </span>
                      <button 
                        className={styles.reputationBtn}
                        onClick={() => updateReputation(u.id, (u.reputation || 0) + 1)}
                        title="Увеличить репутацию"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td>
                    <select className={styles.selectRole} defaultValue={u.role} onChange={(e) => updateRole(u.id, e.target.value)}>
                      <option value="guest">guest</option>
                      <option value="worker">worker</option>
                      <option value="manager">manager</option>
                      <option value="creator">creator</option>
                    </select>
                  </td>
                  <td>
                    <button 
                      className={styles.deleteBtn}
                      onClick={() => deleteUser(u.id, u.username)}
                      disabled={u.username === 'denisunderonov' || String(u.id) === String(user?.id)}
                      title={u.username === 'denisunderonov' ? 'Нельзя удалить главного создателя' : String(u.id) === String(user?.id) ? 'Нельзя удалить самого себя' : 'Удалить пользователя'}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  )
}
