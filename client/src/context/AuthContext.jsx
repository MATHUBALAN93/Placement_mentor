import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            const { data } = res.data;

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
            setLoading(false);
            return { success: true };
        } catch (err) {
            setLoading(false);
            return {
                success: false,
                message: err.response?.data?.message || 'Login failed. Please check credentials.'
            };
        }
    };

    const register = async (name, email, password, confirmPassword) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/register', { name, email, password, confirmPassword });
            const { data } = res.data;

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
            setLoading(false);
            return { success: true };
        } catch (err) {
            setLoading(false);
            return {
                success: false,
                message: err.response?.data?.message || 'Registration failed.'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateProfile = async (profileData) => {
        try {
            const res = await api.put('/auth/profile', profileData);
            const { data } = res.data;
            localStorage.setItem('user', JSON.stringify(data));
            setUser(prev => ({ ...prev, ...data }));
            return { success: true };
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.message || 'Failed to update profile.'
            };
        }
    };

    const changePassword = async (oldPassword, newPassword) => {
        try {
            await api.put('/auth/change-password', { oldPassword, newPassword });
            return { success: true };
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.message || 'Failed to change password.'
            };
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, changePassword }}>
            {children}
        </AuthContext.Provider>
    );
};
