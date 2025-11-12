"use client"

import React from "react"
import { createContext, useState, useContext, useEffect } from 'react'

const AuthContext = createContext(); // создает глобальную переменную для хранения данных авторизации

export const AuthProvider = ({ children }) => { // создает компонент обертку для представления авторизации всем дочерним компонентам
    const [user, setUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        try {
            const token = localStorage.getItem('authToken');
            const userData = localStorage.getItem('userData');

            if(token && userData) { 
                setUser(JSON.parse(userData))
                setIsAuthenticated(true);
            }
        } catch(e) {
            console.log('Ошибка проверки авторизации: ',e);
        } finally {
            setLoading(false);
        }
    }

    const login = (userData, token) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true)
    }

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setUser(null)
        setIsAuthenticated(false);
    }

    return <AuthContext.Provider value={{ // Компонент который делает данные доступными для потомков
        user, isAuthenticated, loading, login, logout, checkAuth // все данные, которые будут доступны через контекст
    }}>{children}</AuthContext.Provider> // Все дочерние компоненты, которые будут иметь доступ к данным
}

export const useAuth = () => useContext(AuthContext) //кастомный хук, упрощает доступ к контексту, вместо useContext(AuthContext) можно писать useAuth()