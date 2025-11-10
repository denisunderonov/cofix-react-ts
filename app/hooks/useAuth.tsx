import { useState, useEffect } from 'react';

export function useAuth() {
  // Получаем состояние напрямую из localStorage при каждом рендере
  const getAuthState = () => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    return {
      isAuthenticated: !!token,
      user: userData ? JSON.parse(userData) : null
    };
  };

//   При монтировании компонента вызывается getAuthState и возвращает 
//   объект с соответствующими свойствами

  const [authState, setAuthState] = useState(getAuthState());

  // Слушаем изменения localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setAuthState(getAuthState()); // обновление состояния
    };

    window.addEventListener('storage', handleStorageChange); // слушаем изменение localstorage в других вкладках
    //Это событие срабатывает когда токен присваивается в localstorage
    // Также обновляем при фокусе окна (на случай вкладок)
    window.addEventListener('focus', handleStorageChange); // слушаем когда пользватель возвращается на вкладку
    // срабатывает когда пользователь переходит в другую вкладку, а затем обратно
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setAuthState({ isAuthenticated: false, user: null });
  };

  return { 
    isAuthenticated: authState.isAuthenticated, 
    user: authState.user, 
    loading: false,
    logout 
  };
}