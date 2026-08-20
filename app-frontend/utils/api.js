import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { API_URL } from '../config';

export const request = async (endpoint, options = {}) => {
  const token = await AsyncStorage.getItem("token");
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Session expired
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      
      Alert.alert(
        "Session Timeout",
        "Please login again",
        [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
      );
      
      throw new Error("Session timed out");
    }

    return response;
  } catch (error) {
    if (error.message !== "Session timed out") {
      console.error("API Request Error:", error);
    }
    throw error;
  }
};
