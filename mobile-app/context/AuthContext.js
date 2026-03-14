import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiBaseUrl';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = API_BASE_URL;

    const saveSecureItem = async (key, value) => {
        try {
            if (Platform.OS === 'web') {
                localStorage.setItem(key, value);
            } else {
                await SecureStore.setItemAsync(key, value);
            }
        } catch (error) {
            console.error('Error saving exact item: ', error);
        }
    };

    const getSecureItem = async (key) => {
        try {
            if (Platform.OS === 'web') {
                return localStorage.getItem(key);
            } else {
                return await SecureStore.getItemAsync(key);
            }
        } catch (error) {
            console.error('Error getting exact item: ', error);
            return null;
        }
    };

    const removeSecureItem = async (key) => {
        try {
            if (Platform.OS === 'web') {
                localStorage.removeItem(key);
            } else {
                await SecureStore.deleteItemAsync(key);
            }
        } catch (error) {
            console.error('Error removing secure entry: ', error);
        }
    };

    useEffect(() => {
        const loadUser = async () => {
            setLoading(true);
            try {
                const storedToken = await getSecureItem('token');
                if (storedToken) {
                    const response = await axios.get(`${API_URL}/user/profile`, {
                        headers: { Authorization: `Bearer ${storedToken}` }
                    });
                    setToken(storedToken);
                    setUser(response.data.user);
                }
            } catch (error) {
                console.error('Failed to load user', error);
                await removeSecureItem('token');
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (userData, jwtToken) => {
        setUser(userData);
        setToken(jwtToken);
        await saveSecureItem('token', jwtToken);
    };

    const updateProfileStatus = (isComplete) => {
        setUser(prev => ({ ...prev, isProfileComplete: isComplete }));
    };

    const logout = async () => {
        setUser(null);
        setToken(null);
        await removeSecureItem('token');
    };

    const updateUser = (updatedUserData) => {
        setUser(prev => ({ ...prev, ...updatedUserData }));
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, updateProfileStatus, updateUser, API_URL }}>
            {children}
        </AuthContext.Provider>
    );
};
