import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiBaseUrl';


export const AuthContext = createContext();

// Custom hook to use AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = API_BASE_URL;

    const saveSecureItem = async (key, value) => {
        try {
            if (value === null || value === undefined) return;
            if (Platform.OS === 'web') {
                localStorage.setItem(key, String(value));
            } else {
                await SecureStore.setItemAsync(key, String(value));
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
                    // Skip backend verification for mock tokens (development)
                    if (storedToken.startsWith('mock_')) {
                        console.log('🔧 Mock token detected, skipping profile fetch');
                        setToken(storedToken);
                        setUser({
                            _id: 'mock_user_id',
                            phoneNumber: '+91XXXXXXXXXX',
                            name: 'Demo User',
                            isProfileComplete: true,
                            memberType: 'standard',
                        });
                    } else {
                        const response = await axios.get(`${API_URL}/account/profile`, {
                            headers: { Authorization: `Bearer ${storedToken}` }
                        });
                        setToken(storedToken);
                        setUser(response.data.data || response.data.user);
                    }
                }
            } catch (error) {
                console.error('Failed to load user:', error.message);
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    console.log('Token is invalid or expired, clearing it.');
                    await removeSecureItem('token');
                }
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
