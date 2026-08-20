"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const PanchayatContext = createContext(null);

export const PanchayatProvider = ({ children }) => {
    const [selectedPanchayat, setSelectedPanchayat] = useState(null);
    const [isPanchayatModalOpen, setIsPanchayatModalOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Initial load from localStorage on client mount
    useEffect(() => {
        setIsMounted(true);
        try {
            const stored = localStorage.getItem('selectedPanchayat');
            if (stored) {
                setSelectedPanchayat(JSON.parse(stored));
            } else {
                setIsPanchayatModalOpen(true);
            }
        } catch {
            setIsPanchayatModalOpen(true);
        }
    }, []);

    // Function to refresh the selected panchayat's data from the server
    const refreshPanchayatData = async () => {
        if (!selectedPanchayat?._id) return;
        try {
            const res = await api.get(`/panchayat/${selectedPanchayat._id}`);
            if (res.data) {
                setSelectedPanchayat(res.data);
            }
        } catch (err) {
            console.error("Failed to refresh panchayat data:", err);
        }
    };

    useEffect(() => {
        if (!isMounted) return;
        try {
            if (selectedPanchayat) {
                localStorage.setItem('selectedPanchayat', JSON.stringify(selectedPanchayat));
                setIsPanchayatModalOpen(false);
            } else {
                localStorage.removeItem('selectedPanchayat');
                setIsPanchayatModalOpen(true);
            }
        } catch (e) {
            console.error("Storage error:", e);
        }
    }, [selectedPanchayat, isMounted]);

    return (
        <PanchayatContext.Provider value={{ 
            selectedPanchayat, 
            setSelectedPanchayat, 
            isPanchayatModalOpen, 
            setIsPanchayatModalOpen,
            refreshPanchayatData
        }}>
            {children}
        </PanchayatContext.Provider>
    );
};

export const usePanchayat = () => {
    const context = useContext(PanchayatContext);
    if (!context) {
        throw new Error('usePanchayat must be used within a PanchayatProvider');
    }
    return context;
};
