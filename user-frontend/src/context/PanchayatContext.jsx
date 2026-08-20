import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const PanchayatContext = createContext(null);

export const PanchayatProvider = ({ children }) => {
    const [selectedPanchayat, setSelectedPanchayat] = useState(() => {
        const stored = localStorage.getItem('selectedPanchayat');
        return stored ? JSON.parse(stored) : null;
    });

    const [isPanchayatModalOpen, setIsPanchayatModalOpen] = useState(false);

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
        if (selectedPanchayat) {
            localStorage.setItem('selectedPanchayat', JSON.stringify(selectedPanchayat));
            setIsPanchayatModalOpen(false);
        } else {
            localStorage.removeItem('selectedPanchayat');
            setIsPanchayatModalOpen(true);
        }
    }, [selectedPanchayat]);

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
